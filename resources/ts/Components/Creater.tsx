import axios, { AxiosResponse } from "axios"
import React, { ReactNode, useEffect, useRef, useState } from "react";
import {UseFormRegisterReturn, useForm } from "react-hook-form";
import { API } from "../Api.js";

export function CreaterUsingButton({close}:{close:(a:boolean)=>void}){
    return (
    <div className="cr-create-btn" onClick={()=>close(false)}>
        <div>+</div>
    </div>
    )
}
export interface Sender{
    name:string,
    id:number
}
export interface EventData{
    id:number
    type:number
    data:{name:string,description:string}
}
interface BaseInput extends React.HTMLAttributes<HTMLDivElement>{
    title:string
    children:ReactNode
}
function BaseInput({title,children,...props}:BaseInput){
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
interface InputZoneAttributes extends React.InputHTMLAttributes<HTMLInputElement>{
    title:string
    setValue?:()=>void
    register:UseFormRegisterReturn<any>
}
function InputZone({title,setValue,register,...props}:InputZoneAttributes){
    let startValue = props.value || '';
    let [value,setter] = setValue ? [startValue,setValue] : useState(startValue);
    return (
        <BaseInput title={title}>
            <input {...props} {...register} value={value} onChange={(e)=>{setter(e.target.value)}}/>
        </BaseInput>
    )
}
interface TimedEvent{
    sender_id:number
    date:string
}
interface CreatingEvent extends TimedEvent{
    eventName:string
    eventDesc:string
}
function MakeForm(){

}
function SelectWithApiData({reqTo,show,title,register}:{register:UseFormRegisterReturn<any>,reqTo:()=>Promise<any>,show:(data:any)=>string | false,title:string}){
    type showItem ={id:number,name:string};
    let [inLoad,setLoadState] = useState(true);
    let [dataList,setDataList] = useState([] as showItem[]);

    let actualrequest = useRef(null as null | Promise<any>);
    useEffect(()=>{
        let prms =actualrequest.current ? actualrequest.current : reqTo()
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
        if(!actualrequest.current){
            actualrequest.current = prms;
            prms.then(()=>{
                actualrequest.current = null;
            })
        }
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
function CreaterWindow({close}:{close:(a:boolean)=>void}){

    const {register,handleSubmit} = useForm<CreatingEvent>();
    function submitMarkEvent(t:CreatingEvent){
        let utcDate = new Date(t.date).toUTCString();
        
        API.events.calendar({
            type:1,
            data:{
                name:t.eventName,
                description:t.eventDesc || ''
            },
            date:utcDate,
            sender_id:t.sender_id
        }).then(()=>{
            close(true);
        })
    }
    function showOptEvent(ev:EventData){
        if(ev.type != 1){
            return false;
        }else{
            return ev.data.name;
        }
    }
    return(
        <div className="cr-backwindow" onClick={(e)=>{if(e.target === e.currentTarget){close(true)}}}>
            <div className="cr-window">
                <div className="cr-forms">
                    
                    <form onSubmit={handleSubmit(submitMarkEvent)}>
                        <h1>Novo Evento</h1>
                        <SelectWithApiData title="Enviar para" 
                            register={register('sender_id',{required:true,valueAsNumber:true})} reqTo={API.sender}
                            show={(e:Sender)=>{return e.name}}/>
                        <button>Criar novo Sender</button>
                        <InputZone register={register('eventName',{required:true})} title="Nome" type="text"/>
                        <InputZone register={register('eventDesc',{required:false})} title="Descrição" type="text"/>
                        <InputZone register={register('date',{required:true})} title="Data" type="datetime-local"/>
                        <input type="submit" value="Salvar Evento"/>
                    </form>
                </div>
            </div>
        </div>
    )
}
function L_Reminder(){
    return (
        <div>
            <input type="text" name="url"/>
            <select name="method" id="">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
            </select>
        </div>
    )
}
function Sender(){
    return (
        <div>

        </div>
    )
}
export default function Creater(){
    const [isClosed,setCloseState] = useState(false);
    return (
        <div>
            {isClosed ? '' : <CreaterWindow close={setCloseState}/>}
            <CreaterUsingButton close={setCloseState}/>
        </div>
    )
}