import { ReactNode, useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export interface InputZoneAttributes extends React.InputHTMLAttributes<HTMLInputElement>{
    title:string
    setValue?:()=>void
    register:UseFormRegisterReturn<any>
}
export interface BaseInput extends React.HTMLAttributes<HTMLDivElement>{
    title:string
    children:ReactNode
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
    let [value,setter] = setValue ? [startValue,setValue] : useState(startValue);
    return (
        <BaseInput title={title}>
            <input {...props} {...register} value={value} onChange={(e)=>{setter(e.target.value)}}/>
        </BaseInput>
    )
}
export function SelectWithApiData({reqTo,show,title,register}:{register:UseFormRegisterReturn<any>,reqTo:()=>Promise<any>,show:(data:any)=>string | false,title:string}){
    type showItem ={id:number,name:string};
    let [inLoad,setLoadState] = useState(true);
    let [dataList,setDataList] = useState([] as showItem[]);
    
    useEffect(()=>{
        let prms =reqTo();
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
    },[]);
    return (
        <span>
            <div className="cr-loading" hidden={!inLoad}>Carregando...</div>
            <BaseInput title={title} hidden={inLoad}>
                <select {...register}>
                    <option value="">---</option>
                    {
                        dataList.map((e,i) =><option key={'cr-'+reqTo.name+i} value={e.id}>{e.name}</option>)
                    }
                </select>
            </BaseInput>
        </span>
    );
}