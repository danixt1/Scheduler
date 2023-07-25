import { Head } from '@inertiajs/react'
import Calendar from '../Components/Calendar.js';
import { CalendarEvent, CalendarEventContext } from '../contexts.js';
import { EventsList } from '../Components/EventsList.js';
import {useState} from 'react';
import Creater from '../Components/Creater.js';
interface PassedEvents{
    date:string,
    type:'reminder',
    name:string,
    desc:string
}
export default function App({errors,events:_evs}:{errors:any,events:PassedEvents[]}){
    let evs:CalendarEvent[] = [];
    
    _evs.map(e =>{
        evs.push({
            date:new Date(e.date + ' UTC'),
            desc:e.desc,
            title:e.name,
            type:e.type
        })
    })
    let [events,setEvents] = useState(evs);
    let eventer = {events,setEvents}
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
                        <Calendar month={2} year={2023} showTop={false} selected={1}></Calendar>
                    </div>
                </CalendarEventContext.Provider>
            </div>
        </>
    );
}