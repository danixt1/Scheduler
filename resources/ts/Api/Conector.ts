import axios, { AxiosResponse } from "axios";
import { Routes, InputerFunc, FuncApi, ApiBaseItem,ApiConfig, ListOfItems } from "./Api";
import EventEmitter from "eventemitter3";
const allRoutes:{[index:string]:any} = {};
/** list with all GET operations running.
 * case some get is already running the `get()` method just connect to this promise */
const runningGets:{[index:string]:Promise<AxiosResponse>} = {};

export function buildApi<T = any,CREAT = T>(config:ApiConfig | string, routes:Routes){
    let ret:{[index:string]:FuncApi<T,CREAT>} = {};
    let ApiUrl = typeof config === 'string'?config : config.url;
    if(!ApiUrl.endsWith('/')){
        ApiUrl +='/';
    }
    for(const [index,value] of Object.entries(routes)){
        let itemName = '';
        let build:{[index:string]:(val:any)=>any} = {};
        let inputer:{[index:string]:InputerFunc} = {};
        if(typeof value === 'string'){
            itemName = value;
        }else{
            itemName = value.name;
            build = value.output || {};
            inputer = value.input || {};
            if(value.ref){
                for(const ref of value.ref){
                    build[ref] = buildRefProperty;
                    inputer[ref] = (val:number)=>{
                        return {value:val,dbName:ref+'_id'}
                    }
                }
            }
        }
        let fullPath = ApiUrl + index;
        let thisloc = buildFuncApi<T,CREAT>(fullPath,build,inputer);
        allRoutes[fullPath] = thisloc;
        ret[itemName] = thisloc;
    }
    return ret;
}
export function buildFuncApi<T = any,CREAT = any>(route:string,builds?:any,inputers?:any):FuncApi<T,CREAT>{
    const ACT_LOC = route;
    let emitter = new EventEmitter();
    let func =<FuncApi<any,any>> function(data?:any):Promise<any>{
        if(!data){
            return getAll();
        }
        if(typeof data === 'number'){
            return getItem(data);
        }else{
            if(typeof data === 'object'){
                return (data['id'] != undefined &&  (typeof data['id'] == 'number' || data['id'].length > 0)) ? update() : create();
            }
            throw "Invalid passed data";
        }
        async function update(){
            let id:number =Number.parseInt(data.id);
            delete data.id;
            await axios.post(ACT_LOC + '/'+id,data);
            let item = await get(ACT_LOC + '/'+id);
            return makeItem(item.data,ACT_LOC+'/'+id);
        }
        async function create(){
            let res = await axios.post(ACT_LOC,data);
            let id = res.data;
            let item = await get(ACT_LOC + '/'+id);
            let finalItem = makeItem(item.data,ACT_LOC+'/'+id);
            emitter.emit('create',finalItem);
            return finalItem;
        }
        async function getItem(id:number){
            let res =await get(ACT_LOC+'/'+id);
            return makeItem(res.data,ACT_LOC+'/'+id);
        }
    }
    async function getAll(getIn:string = ACT_LOC):Promise<ListOfItems<any>>{
        let all =await get(getIn);
        let data = all.data;
        let final = getIn.includes('?') ? getIn.indexOf('?') : getIn.length;
        
        return {
            page: data.meta.current_page,
            list: data.data.map((e:any)=>makeItem(e,getIn.substring(0,final)+'/'+e.id)),
            async next() {
                let next:string | null = data.links.next;
                if(!next){
                    return null;
                }else{
                    return await getAll(next);
                }
            },
        }
    }
    func.off = (mode,callback)=>{
        emitter.off(mode,callback);
    }
    func.on = (mode,callback)=>{
        emitter.on(mode,callback);
    }
    func.delete =(item:string | number)=>{
        return new Promise((res)=>{
            emitter.emit('delete',null);
            axios.delete(ACT_LOC+'/'+item).then(()=>res(true)).catch(()=>res(false));
        })
    }
    func.withForeign = (name,id)=>{
        return getAll(`${ACT_LOC}?${name}_id=${id}`)
    }
    return func;
    function makeItem(data:any,path:string){
        let item = buildApiItem(transform(data),path,inputers,builds);
        item.on('delete',()=>{
            emitter.emit('delete',item);
        })
        item.on('update',()=>{
            emitter.emit('update',item);
        })
        return item;
    }
    function transform(item:any){
        let finalITem:any = {};
        for(const [index,value] of Object.entries(item)){
            finalITem[index] = builds[index] ? builds[index](value) : value;
        }
        return finalITem;
    }
}
export function buildApiItem(data:any,path:string,setter:{[index:string]:InputerFunc} = {},out:any = {}){
    let toUpdate:any ={};
    let isDeleted = false;
    let updateSetted = false;
    let emitter = new EventEmitter();
    let fireOnEnd:()=>void = ()=>{};
    let info:ApiBaseItem = {
        id:-1,
        on(event,callback){
            emitter.on(event,callback)
        },
        off(mode, callback) {
            emitter.off(mode,callback)
        },
        async delete() {
            if(!isDeleted){
                try{
                    await axios.delete(path);
                    emitter.emit('delete');
                    isDeleted = true;
                    return true;
                }catch(e){
                    return false;
                }
            }else{
                return true;
            }
        },
        get deleted(){
            return isDeleted;
        },
        waitUpdate() {
            return new Promise((res)=>{
                if(updateSetted){
                    fireOnEnd = ()=>{
                        emitter.emit('update');
                        res(true)
                    }
                }
                res(false);
            })
        },
    };
    for(const key of Object.keys(data)){
        Object.defineProperty(info,key,{
            get(){
                return data[key];
            },
            set(newValue:any){
                if(setter[key]){
                    let ret = setter[key](newValue);
                    toUpdate[ret.dbName || key] = ret.value;
                }else{
                    toUpdate[key] =newValue;
                }
                if(!updateSetted){
                    if(isDeleted){
                        return
                    }
                    setTimeout(()=>{
                        axios.post(path,toUpdate).finally(()=>{
                            updateSetted = false;
                            toUpdate = {};
                            fireOnEnd();
                            fireOnEnd = ()=>{};
                        }).then(e =>{
                            let retData = e.data;
                            for(const [index,value] of Object.entries<(a:any)=>any>(out)){
                                retData[index] = value(retData[index]);
                            }
                            data = retData;
                        })
                    })
                    updateSetted = true;
                }
            }
        })
    }
    return info;
}
export function buildRefProperty(link:string){
    let url:URL;
    try{
        url =new URL(link);
    }catch(error:any){
        throw new Error('Invalid passed link, link:'+link+' not is vaalid');
    }
    let pathname = url.pathname;
    let last = pathname.lastIndexOf('/');
    
    let id =Number.parseInt(pathname.substring(last + 1));
    return {
        id,
        get:()=>allRoutes[pathname.substring(0,last)](id)
    }
}
function get(path:string,data:any = undefined):Promise<AxiosResponse>{
    if(typeof runningGets[path] != 'undefined' && data === undefined){
        return runningGets[path];
    }
    let prms =<Promise<AxiosResponse>> new Promise((res,rej)=>{
        axios.get(path,data).then(res).catch(rej).finally(()=>{
            delete runningGets[path];
        })
    })
    runningGets[path] = prms;
    return prms;
}