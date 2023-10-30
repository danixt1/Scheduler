import {useContext, useEffect} from "react"
import { CalendarEventContext } from "../contexts";
import { ApiItem } from "../Api/Api";
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
    function editItem(){
        
    }
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
            <div onClick={()=>{ev.item.delete()}}>Deletar</div>
            <div>Editar</div>
        </div>
    </div>
    )
}
export function EventsList({month}:{month?:number}){

    const {events} =useContext(CalendarEventContext);
    const useEvs =month ?events.filter(d =>d.date.getMonth() + 1 == month) : events;
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