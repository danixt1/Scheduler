import {useContext} from "react"
import {CalendarEvent, CalendarEventContext } from "../contexts.js"
//import "../../css/eventList.css"
function EventItem({ev,monthMode}:{ev:CalendarEvent,monthMode:boolean}){
    const {title,date,desc} = ev;
    const d = date.getDate(),y = date.getFullYear(),m = date.getMonth();
    let description = desc || ''
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
    </div>
    )
}
export function EventsList({monthMode = true}:{monthMode?:boolean}){

    const {events} =useContext(CalendarEventContext);
    return (
        <div className="itemList">
            {events.map((e,n) =><EventItem ev={e} monthMode={monthMode} key={'EvIt'+n+'-'+Math.random().toFixed(8)}/>)}
        </div>
    )
}