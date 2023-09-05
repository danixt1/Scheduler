import { Head } from '@inertiajs/react'
import Calendar from '../Components/Calendar.js';
import { CalendarEvent, CalendarEventContext } from '../contexts.js';
import { EventsList } from '../Components/EventsList.js';
import {useEffect, useRef, useState} from 'react';
import Creater from '../Components/Creater.js';
import { API } from '../Api/index.js';
import { ApiItem } from '../Api/Api.js';
import { ItemEvCalendar } from '../Api/Items.js';

const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
interface PassedEvents{
    date:string,
    type:'reminder',
    name:string,
    desc:string
}
export default function App({errors,events:_evs}:{errors:any,events:PassedEvents[]}){
    let [events,setEvents] = useState([] as ApiItem<ItemEvCalendar>[]);
    let actDay = new Date();
    let month = actDay.getMonth() + 1;
    let year = actDay.getFullYear();
    let [date,setDate] = useState({month,year});
    let setteRef = useRef(setDate);
    let updMonth =(make:'add'|'rem')=>{
        var op = make === 'add' ? 1 : -1;
        let newMonth = date.month + op;
        let actualSetter;
        if(newMonth > 12){
            actualSetter = {month:1,year:++date.year};
            setDate(actualSetter);
            return actualSetter;
        };
        if(newMonth < 1){
            actualSetter = {month:12,year:--date.year}
            setDate(actualSetter);
            return actualSetter;
        };
        actualSetter = {month:newMonth,year:date.year};
        setDate(actualSetter);
        return actualSetter;
    }
    useEffect(()=>{
        API.events.calendar().then(e =>{
            setEvents([...e.list]);
        })
    },[]);
    let eventer = {events,setEvents}
    return (
        <>
        <Head title="Testing"/>
            <div style={{position:'absolute',width:'100%',height:'100%'}} className='app-twoParts'>
                <CalendarEventContext.Provider value={eventer}>
                    <Creater/>
                    <div className='app-pt1'>
                        <EventsList month={date.month} />
                    </div>
                    <div className='app-pt2'>
                        <Calendar month={date.month} year={date.year} showTop={false} selected={date.month === month && date.year === year ? actDay.getDate() : null}>
                            <div className="cl-btn cl-before" onClick={(ev)=>{updMonth('rem')}}>{'<'}</div>
                            <div className="cl-title">{months[date.month - 1] + ' '+date.year}</div>
                            <div className="cl-btn cl-after" onClick={(ev)=>{updMonth('add')}} >{'>'}</div>
                        </Calendar>
                    </div>
                </CalendarEventContext.Provider>
            </div>
        </>
    );
}