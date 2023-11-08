import {useContext, useEffect, useState} from "react"
import { CalendarEventContext } from "../contexts";
import { ApiItem } from "../Api/Api";
import { FormPopUp } from "./PopUp";
import { FormEvent } from "./Creater/Forms";
import { SvgEdit, SvgTrash } from "../Svgs";
//import "../../css/eventList.css"
interface EventData{
    title:string
    date:Date
    desc:string
    item:ApiItem<{}>
}
function EventItem({ev,monthMode}:{ev:EventData,monthMode:boolean}){
    const {title,date,desc} = ev;
    const d = date.getDate(),y = date.getFullYear(),m = date.getMonth();
    let description = desc || ''
    let [clickedInEdit,setClickedInEdit] = useState(false);
    return(
    <div className="eventItem">
        <div className="ev-title">{title}</div>
        <div className="ev-day-hour">
            <div>{monthMode ?"Dia "+d : `${y}/${m}/${d}`}</div>
            <div>{date.getHours() +':'+date.getMinutes()}</div>
        </div>
        <div className="ev-desc">
            {description}
        </div>
        <div className="ev-edit">
            <div onClick={()=>{ev.item.delete()}}><SvgTrash/></div>
            <div onClick={()=>{setClickedInEdit(true)}}><SvgEdit/></div>
            {clickedInEdit ? <FormPopUp onBackClickClose={()=>{setClickedInEdit(false)}} ><FormEvent apiItem={ev.item as any}/></FormPopUp> : ''}
        </div>
    </div>
    )
}
export function EventsList({month}:{month?:number}){

    const {events} =useContext(CalendarEventContext);
    const useEvs =(month ?events.filter(d =>d.date.getMonth() + 1 == month) : events).sort((a,b)=>a.date.getDate() - b.date.getDate());
    const monthMode = typeof month === 'number';
    return (
        <div className="itemList">
            {useEvs.map((e,n) =><EventItem 
            ev={{date:e.date,desc:e.data.description,title:e.data.name,item:e}} 
            monthMode={monthMode} 
            key={'EvIt'+n+'-'+Math.random().toFixed(8)}/>)}
        </div>
    )
}