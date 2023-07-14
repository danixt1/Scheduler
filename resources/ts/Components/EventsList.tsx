import {useContext} from "react"
import {CalendarEvent, CalendarEventContext } from "../contexts.js"
//import "../../css/eventList.css"
function EventItem({ev,monthMode}:{ev:CalendarEvent,monthMode:boolean}){
    const {title,date,hour,minutes,desc} = ev;
    let description = desc || ''
    return(
    <div className="eventItem">
        <div className="ev-title">{title}</div>
        <div className="ev-day-hour">
            <div>{monthMode ?"Dia "+date.d : `${date.y}/${date.m}/${date.d}` }</div>
            <div>{`${hour}:${minutes}`}</div>
        </div>
        <div className="ev-desc">
            {description}
        </div>
    </div>
    )
}
export function EventsList({monthMode = true}:{monthMode?:boolean}){

    const {events} =useContext(CalendarEventContext)
    console.log(events);
    return (
        <div className="itemList">
            {events.map((e,n) =><EventItem ev={e} monthMode={monthMode} key={'EvIt'+n+'-'+Math.random().toFixed(8)}/>)}
        </div>
    )
}