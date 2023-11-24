import React, { createContext, useState } from "react";
import { CloseWindownContext, FormEvent, FormListLocation, FormListSender, FormLocation, FormSelector, FormSender } from "./Forms";
import { FormPopUp } from "../PopUp";
export interface EventData{
    id:number
    type:number
    data:{name:string,description:string}
}
export function CreaterUsingButton({close}:{close:(a:boolean)=>void}){
    return (
    <div className="cr-create-btn" onClick={()=>close(false)}>
        <div>+</div>
    </div>
    )
}

function CreaterWindow({close,hidden}:{close:(a:boolean)=>void,hidden:boolean}){
    let [actualVisible,setVisible] = useState('event');
    function setTrigger(name:string){
        return {
            onClick(){
                setVisible(name);
            },
            hidden:actualVisible == name
        }
    }
    return(
        <FormPopUp onBackClickClose={()=>{close(true)}} hidden={hidden}>
            <div className="cr-forms">
                <FormSelector.Provider value={[actualVisible,setVisible]}>
                    <CloseWindownContext.Provider value={close}>
                        <FormListLocation/>
                        <FormListSender/>
                        <FormEvent/>
                    </CloseWindownContext.Provider>
                </FormSelector.Provider>
                <div className="cr-create-btns">
                    <button {...setTrigger('sender')}>Criar Sender</button>
                    <button {...setTrigger('event')}>Criar Evento</button>
                    <button {...setTrigger('location')}>Criar Local</button>
                </div>
            </div>
        </FormPopUp>
    )
}
export default function Creater(){
    const [isClosed,setCloseState] = useState(false);
    return (
        <span>
            <CreaterWindow close={setCloseState} hidden={isClosed}/>
            <CreaterUsingButton close={setCloseState}/>
        </span>
    )
}