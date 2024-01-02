import { ReactNode, useContext, useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { ApiItem, FuncApi } from "../../Api/Api";
import { CtxErrorsInForm } from "./Ctxs";

export interface InputZoneAttributes extends React.InputHTMLAttributes<HTMLInputElement>{
    title:string
    setValue?:()=>void
    register:UseFormRegisterReturn<any>
    /** specify the name on error in property */
    errName?:string
}
export interface BaseInput extends React.HTMLAttributes<HTMLDivElement>{
    title:string
    children:ReactNode
    name:string
    /** specify the name on error in property */
    errName?:string
}
export interface SelectZoneAttrs extends React.HTMLAttributes<HTMLSpanElement>{
    title:string
    register:UseFormRegisterReturn<any>
    reqTo:FuncApi<any,any>
    show:(data:any)=>string | false
    inRequest?:(prms:ReturnType<FuncApi<any,any>>)=>void
    /** Invoked after list finished loading to set def prop */
    setDefValue?:()=>void
    /** specify the name on error in property */
    errName?:string
}
export function BaseInput({title,children,name,...props}:BaseInput){
    let ctx = useContext(CtxErrorsInForm);
    let [msgError,setMsgError] = useState('');
    let errName = props.errName || title;
    const msgs:any = {
        'required':()=>`${errName} é obrigatório`,
        'pattern':'Padrão inválido'
    }
    useEffect(()=>{
        let checkTo = ctx[name];
        if(!checkTo){
            setMsgError('');
            return;
        }
        if(!checkTo.type){
            setMsgError('');
            return;
        }
        let existErr = msgs[checkTo.type as string];
        
        if(!existErr){
            console.log(checkTo);
            setMsgError('');
            return;
        }
        setMsgError(typeof existErr === 'string' ? existErr : existErr());
    },[ctx]);
    return (
    <div className="cr-box-input" {...props}>
        <div className="cr-data-title">
            {title}
        </div>
        <div className="cr-data-input">
            {children}
        </div>
        <div hidden={msgError == ''} className="cr-data-msg-error">
            {msgError}
        </div>
    </div>
    )
}
export function InputZone({title,setValue,register,...props}:InputZoneAttributes){
    return (
        <BaseInput title={title} name={register.name} errName={props.errName}>
            <input {...props} {...register}/>
        </BaseInput>
    )
}
export function SelectWithApiData({reqTo,show,title,register,inRequest,setDefValue,...attrs}:SelectZoneAttrs){
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
    useEffect(()=>{
        if(inLoad){
            return;
        };
        if(setDefValue){
            setDefValue();
        }
    },[inLoad]);
    return (
        <span {...attrs}>
            <div className="cr-loading" hidden={!inLoad}>Carregando...</div>
            <BaseInput title={title} hidden={inLoad} name={register.name} errName={attrs.errName}>
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