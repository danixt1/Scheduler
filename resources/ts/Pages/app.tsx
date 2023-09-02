import { Head } from '@inertiajs/react'
import Calendar from '../Components/Calendar.js';
import { CalendarEvent, CalendarEventContext } from '../contexts.js';
import { EventsList } from '../Components/EventsList.js';
import {useEffect, useState} from 'react';
import Creater from '../Components/Creater.js';
import { API } from '../Api/index.js';
interface PassedEvents{
    date:string,
    type:'reminder',
    name:string,
    desc:string
}
export default function App({errors,events:_evs}:{errors:any,events:PassedEvents[]}){
    let evs:CalendarEvent[] = [];
    let [events,setEvents] = useState(evs);
    useEffect(()=>{
        API.events.calendar().then(e =>{
            for(const event of e.list){
                evs.push({
                    date:event.date,
                    desc:event.data.description,
                    title:event.data.name,
                    type:"reminder"
                })
            }
            setEvents([...evs]);
        })
    },[]);
    let eventer = {events,setEvents}
    let actDay = new Date();
    return (
        <>
        <Head title="Testing"/>
            <div style={{position:'absolute',width:'100%',height:'100%'}} className='app-twoParts'>
                <CalendarEventContext.Provider value={eventer}>
                    <Creater/>
                    <div className='app-pt1'>
                        <EventsList/>
                    </div>
                    <div className='app-pt2'>
                        <Calendar month={actDay.getMonth() + 1} year={actDay.getFullYear()} showTop={false} selected={actDay.getDate()}></Calendar>
                    </div>
                </CalendarEventContext.Provider>
            </div>
        </>
    );
}