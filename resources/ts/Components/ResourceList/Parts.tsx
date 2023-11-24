import { useState,useEffect, createContext, useContext } from "react";
import { ApiItem, FuncApi } from "../../Api/Api"
import { SvgEdit, SvgTrash } from "../../Svgs";
export const EditListContext = createContext((item:ApiItem<any>)=>{});
//TODO make the base structure from the resource list
type ResourceItemProp =number | string | boolean | {ref:number,name:string}
interface ResourceListI<T>{
    api:FuncApi<T,any>
    renamer?:Record<string,string>
    propsToreturn:string[]
}
interface ResourceItemI{
    propsToReturn:string[]
    item:ApiItem<Record<any,any>>
}
export function ResourceList<PROPS extends {[index:string]:any} = {[index:string]:any}>({api,propsToreturn,renamer}:ResourceListI<PROPS>){
    let [isLoading,setLoadingState] = useState(true);
    let [data,setData] = useState([] as any[]);
    let [head,setHead] = useState([] as string[]);
    useEffect(()=>{
        api().then(e =>{
            let list = e.list;
            if(list.length > 0){
                setHead(renamer ? propsToreturn.map(e => renamer[e] || e) : propsToreturn)
            }
            setData(list);
            setLoadingState(false);
        })
        api.on('create',onCreate);
        api.on('delete',onDelete);
        api.on('update',onEdit);
        return ()=>{
            api.off('create',onCreate);
            api.off('delete',onDelete);
            api.off('update',onEdit);
        }
        function onCreate(newItem:any){
            setData(e => [...e,newItem])
        }
        function onDelete(e:any){
            let id:number = e.id;
            setData(a => [...a.filter(t => t.id != id)])
        }
        function onEdit(e:any){
            let id:number = e.id;
            setData(a => [...a])
        }
    },[]);
    return (
        <div>
            <span hidden={!isLoading}>Carregando Dados...</span>
            <table hidden={isLoading}>
                <thead className="rl-t-head">
                    <tr>
                        {head.map((e,i) => <th key={'head-'+i}>{e}</th>)}
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((e,i) => <ResourceItem propsToReturn={propsToreturn} item={e} key={'list-'+i}/> )
                    }
                </tbody>
            </table>
        </div>
    )
}

export function ResourceItem({propsToReturn,item}:ResourceItemI){
    let onEdit = useContext(EditListContext);
    return (
        <tr>
            {
                propsToReturn.map( (e,i) =>{
                    let value = item[e];
                    let finalVal:any = '';
                    switch(typeof value){
                        case "boolean":
                            finalVal =value ? "Sim" : "Não";
                            break;
                        default:
                            finalVal = value;
                            break;
                    }
                    return <th key={'i-'+i}>{finalVal}</th>
                })
            }
            <th onClick={()=>{onEdit(item)}}><SvgEdit/></th>
            <th onClick={()=>{item.delete()}}><SvgTrash/></th>
        </tr>
    )
}