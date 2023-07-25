import axios from "axios"
import React, { ReactNode, useEffect, useState } from "react";

export function CreaterUsingButton(){
    return (
    <div className="cr-create-btn">
        <div>+</div>
    </div>
    )
}
export interface Sender{
    name:string,
    id:number
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
function InputZone({title,name,type= 'text',value}:{title:string,name:string,type?:React.HTMLInputTypeAttribute,value?:string}){
    return (
        <BaseInput title={title}>
            <input type={type} name={name} value={value || ''}/>
        </BaseInput>
    )
}
function CreaterWindow(){
    let [inLoad,setInLoad] = useState(true);
    let [senderList,setSenderList] = useState([] as Sender[]);
    useEffect(()=>{
        axios.get('/api/sender').then(e =>{
            setSenderList(e.data);
            setInLoad(false);
        });
    },[]);
    return(
        <div className="cr-backwindow">
            <div className="cr-window">
                <div className="cr-forms">
                    <h1>Novo Evento</h1>
                    <div className="cr-senders">
                        <div hidden={!inLoad}>Carregando...</div>
                        <BaseInput title="Enviar para:" hidden={inLoad}>
                            <select name="sender">
                                {senderList.map((e,i)=>{
                                    return <option key={'cr-'+i}>{e.name}</option>
                                })}
                            </select>
                        </BaseInput>
                        <button>Criar novo Sender</button>
                    </div>
                    <InputZone name="eventName" title="Nome Do Evento"/>
                    <InputZone name="description" title="Descrição"/>
                    <InputZone name="eventDate" title="Data" type="date"/>

                    <button>Salvar Evento</button>
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

    return (
        <div>
            <CreaterWindow/>
            <CreaterUsingButton/>
        </div>
    )
}