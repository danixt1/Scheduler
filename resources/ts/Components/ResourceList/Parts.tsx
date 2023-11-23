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
    onEdit(item:ApiItem<any>):void
}
export function ResourceList<PROPS extends {[index:string]:any} = {[index:string]:any}>({api,propsToreturn,renamer}:ResourceListI<PROPS>){
    let [isLoading,setLoadingState] = useState(true);
    let [data,setData] = useState([] as any[]);
    let [head,setHead] = useState([] as string[]);
    let onEdit = useContext(EditListContext);
    useEffect(()=>{
        api().then(e =>{
            let list = e.list;
            if(list.length > 0){
                setHead(renamer ? propsToreturn.map(e => renamer[e] || e) : propsToreturn)
            }
            setData(list);
            setLoadingState(false);
        })
    })
    return (
        <div>
            <span hidden={!isLoading}>Carregando Dados...</span>
            <table hidden={isLoading}>
            <tr className="rl-t-head">
                {head.map(e => <th>{e}</th>)}
                <th></th>
                <th></th>
            </tr>
            {
                data.map(e => <ResourceItem propsToReturn={propsToreturn} item={e} onEdit={onEdit}/> )
            }
            </table>
        </div>
    )
}

export function ResourceItem({propsToReturn,item,onEdit}:ResourceItemI){
    return (
        <tr>
            {
                propsToReturn.map( e =>{
                    let value = item[e];
                    switch(typeof value){
                        case "boolean":
                            return <th>{value ? "Sim" : "Não"}</th>;
                        default:
                            return <th>{value}</th>
                    }
                })
            }
            <th onClick={()=>{onEdit(item)}}><SvgEdit/></th>
            <th onClick={()=>{item.delete()}}><SvgTrash/></th>
        </tr>
    )
}