import { useState } from "react";
import { FormEvent, FormLocation } from "./Forms";

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
    return(
        <div className="cr-backwindow" onClick={(e)=>{if(e.target === e.currentTarget){close(true)}}} hidden={hidden}>
            <div className="cr-window">
                <div className="cr-forms">
                    <FormLocation close={close} hidden/>
                    <FormEvent close={close}/>
                </div>
            </div>
        </div>
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