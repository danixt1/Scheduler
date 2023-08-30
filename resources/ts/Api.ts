import axios from "axios";

const BASE_URL = '/api/v1/';
const allRoutes:{[index:string]:any} = {};

type ApiRouting<A> ={
    [Prop in keyof A]: A[Prop] extends Array<any> ? funcApi<A[Prop][0],A[Prop][1]> : A[Prop] extends Item ? funcApi<A[Prop],genericEntry<A[Prop]>> : ApiRouting<A[Prop]>
}
type genericEntry<A> =remapEntry<Omit<A,'id'>>
type remapEntry<A> = {
    [Prop in keyof A]:A[Prop] extends ApiRef<any> ? number : A[Prop] extends Date ? string : A[Prop]
} 
interface Routes{
    [route:string]:string | {name:string, build:{[index:string]:(prop:any)=>any},ref?:string[]}
}
interface funcApi<T,CREAT>{
    ():Promise<{list:(ApiItem<T>)[]}>
    (data:number):Promise<ApiItem<T>>
    (data:CREAT):Promise<ApiItem<T>>
}
type ApiItem<T> = ApiBaseItem & T;
interface ApiRef<T>{
    id:number,
    get:()=>Promise<ApiItem<T>>
}
interface Item{
    id:number
}
interface ItemSender extends Item{
    name:string
}
interface ItemLocation extends Item{
    type:number
    name:string
    data:any
}
interface ItemEvData extends Item{
    type:number,
    data:{
        name:string,
        description:string
    }
}
interface ItemEvTimers extends Item{
    date:Date
    data:ApiRef<ItemEvData>
    sender:ApiRef<ItemSender>
}
interface ItemEvCalendar extends ItemEvData{
    date:Date
    timer:ApiRef<ItemEvTimers>
    event:ApiRef<ItemEvData>
    sender:ApiRef<ItemSender>
}
interface ApiItems{
    sender:ItemSender
    location:ItemLocation
    events:{
        data:ItemEvData
        calendar:[ItemEvCalendar,genericEntry<Omit<ItemEvCalendar,'timer'|'event'|'sender'> & {sender_id:number}>]
        timer:ItemEvTimers
    }
}
interface ApiBaseItem{
    waitUpdate():Promise<boolean>
    delete():Promise<boolean>
    readonly deleted:boolean
}
function buildApi(routes:Routes){
    let ret:{[index:string]:any} = {};
    for(const [index,value] of Object.entries(routes)){
        let itemName = '';
        let build:{[index:string]:(val:any)=>any} = {};
        if(typeof value === 'string'){
            itemName = value;
        }else{
            itemName = value.name;
            build = value.build;
            if(value.ref){
                for(const ref of value.ref){
                    build[ref] = buildRef;
                }
            }
        }
        let fullPath = BASE_URL + index;
        let thisloc = buildFuncApi(fullPath,build);
        allRoutes[fullPath] = thisloc;
        ret[itemName] = thisloc;
    }
    return ret;
}
function buildFuncApi(route:string,builds?:any):funcApi<any,any>{
    const ACT_LOC = route;
    return async (data?:any):Promise<any>=>{
        if(!data){
            let all =await axios.get(ACT_LOC);
            return {list: all.data.map((e:any)=>{
                return buildApiItem(transform(e),ACT_LOC+'/'+e.id);
            })}
        }
        if(typeof data === 'number'){
            let res =await axios.get(ACT_LOC+'/'+data);
            return buildApiItem(transform(res.data),ACT_LOC+'/'+data);
        }else{
            let res = await axios.post(ACT_LOC,data);
            let id = res.data;
            let item = await axios.get(ACT_LOC + '/'+id);
            return buildApiItem(transform(item.data),ACT_LOC+'/'+id);
        }
    }
    function transform(item:any){
        if(builds){
            for(const [index,value] of Object.entries<(a:any)=>any>(builds)){
                item[index] = value(item[index]);
            }
        };
        return item;
    }
}
function buildApiItem(data:any,path:string){
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
                toUpdate[key] = newValue;
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

                        });
                    })
                    updateSetted = true;
                }
            }
        })
    }
    return info;
}
function buildRef(link:string){
    let url = new URL(link);
    let last = url.pathname.lastIndexOf('/');
    
    let id =Number.parseInt(url.pathname.substring(last + 1));
    return {
        id,
        get:()=>allRoutes[url.pathname.substring(0,last)](id)
    }
}
let mainRoutes = buildApi({
    senders:'sender',
    locations:'location'
})
let eventsRoutes = buildApi({
    'events/data':'data',
    'events/calendar':{
        name:'calendar',
        build:{
            date:(prop)=>new Date(prop + ' UTC')
        },
        ref:['timer','event','sender']
    },
    'events/timers':{
        name:'timer',
        build:{
            date:(prop)=>new Date(prop + ' UTC'),
        },
        ref:['data','sender']
    }
})
mainRoutes.events = eventsRoutes;
//@ts-ignore
window.api = mainRoutes;

export const API = <ApiRouting<ApiItems>> mainRoutes;
