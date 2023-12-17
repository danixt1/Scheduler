import { ReactNode, useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { ApiItem, FuncApi } from "../../Api/Api";

export interface InputZoneAttributes extends React.InputHTMLAttributes<HTMLInputElement>{
    title:string
    setValue?:()=>void
    register:UseFormRegisterReturn<any>
}
export interface BaseInput extends React.HTMLAttributes<HTMLDivElement>{
    title:string
    children:ReactNode
}
export interface SelectZoneAttrs extends React.HTMLAttributes<HTMLSpanElement>{
    title:string
    register:UseFormRegisterReturn<any>
    reqTo:FuncApi<any,any>
    show:(data:any)=>string | false
    inRequest?:(prms:ReturnType<FuncApi<any,any>>)=>void
    selected?:string | number
}
export function BaseInput({title,children,...props}:BaseInput){
    return (
    <div className="cr-box-input" {...props}>
        <div className="cr-data-title">
            {title}
        </div>
        <div className="cr-data-input">
            {children}
        </div>
    </div>
    )
}
export function InputZone({title,setValue,register,...props}:InputZoneAttributes){
    let startValue = props.value || '';
    //let [value,setter] = setValue ? [startValue,setValue] : useState(startValue);
    return (
        <BaseInput title={title}>
            <input {...props} {...register} />
        </BaseInput>
    )
}
export function SelectWithApiData({reqTo,show,title,register,inRequest,selected,...attrs}:SelectZoneAttrs){
    type showItem ={id:number,name:string};
    let [inLoad,setLoadState] = useState(true);
    let [dataList,setDataList] = useState([] as showItem[]);
    useEffect(()=>{
        let prms =reqTo();
        reqTo.on('create',onCreated);
        if(inRequest){
            inRequest(prms);
        }
        prms.then(e =>{
            let items:showItem[] = [];
            for(const item of e.list){
                let showName = show(item);
                if(showName){
                    items.push({id:item.id,name:showName})
                }
            }
            setLoadState(false);
            setDataList(items);
        })
        return ()=>{
            reqTo.off('create',onCreated);
        }
        function onCreated(item:ApiItem<any> | null){
            if(item){
                let obj:{name: string,id: number} = {
                    id:item.id,
                    name:item.name
                };
                setDataList(e =>[...e,obj]);
            }
        }
    },[]);
    return (
        <span {...attrs}>
            <div className="cr-loading" hidden={!inLoad}>Carregando...</div>
            <BaseInput title={title} hidden={inLoad}>
                <select {...register} value={selected != undefined ? selected : undefined}>
                    <option value="">---</option>
                    {
                        dataList.map((e,i) =><option key={'cr-'+reqTo.name+i} value={e.id}>{e.name}</option>)
                    }
                </select>
            </BaseInput>
        </span>
    );
}