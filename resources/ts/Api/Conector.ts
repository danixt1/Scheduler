import axios, { AxiosResponse } from "axios";
import { Routes, InputerFunc, FuncApi, ApiBaseItem } from "./Api";
const BASE_URL = '/api/v1/';
const allRoutes:{[index:string]:any} = {};
/** list with all GET operations running.
 * case some get is already running the `get()` method just connect to this promise */
const runningGets:{[index:string]:Promise<AxiosResponse>} = {};

export function buildApi(routes:Routes){
    let ret:{[index:string]:any} = {};
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
        let fullPath = BASE_URL + index;
        let thisloc = buildFuncApi(fullPath,build,inputer);
        allRoutes[fullPath] = thisloc;
        ret[itemName] = thisloc;
    }
    return ret;
}
export function buildFuncApi(route:string,builds?:any,inputers?:any):FuncApi<any,any>{
    const ACT_LOC = route;
    
    let func =<FuncApi<any,any>> function(data?:any):Promise<any>{
        if(!data){
            return getAll();
        }
        if(typeof data === 'number'){
            return getItem(data);
        }else{
            if(typeof data === 'object'){
                return data['id'] == undefined ? create() : update();
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
            return makeItem(item.data,ACT_LOC+'/'+id);
        }
        async function getItem(id:number){
            let res =await get(ACT_LOC+'/'+id);
            return makeItem(res.data,ACT_LOC+'/'+id);
        }
        async function getAll(){
            let all =await get(ACT_LOC);
            return {
                list: all.data.map((e:any)=>makeItem(e,ACT_LOC+'/'+e.id))
            }
        }
    }
    func.delete =(item:string | number)=>{
        return new Promise((res)=>{
            axios.delete(ACT_LOC+'/'+item).then(()=>res(true)).catch(()=>res(false));
        })
    }
    return func;
    function makeItem(data:any,path:string){
        return buildApiItem(transform(data),path,inputers,builds);
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
    let fireOnEnd:()=>void = ()=>{};
    let info:ApiBaseItem = {
        async delete() {
            if(!isDeleted){
                try{
                    await axios.delete(path);
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