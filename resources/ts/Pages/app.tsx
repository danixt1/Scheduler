import { Head } from '@inertiajs/react'
import Calendar from '../Components/Calendar.js';
import {  CalendarEventContext } from '../contexts.js';
import { EventsList } from '../Components/EventsList.js';
import {useEffect, useRef, useState} from 'react';
import { API } from '../Api/index.js';
import { ApiItem } from '../Api/Api.js';
import { ItemEvCalendar } from '../Api/Items.js';
import Creater from '../Components/Creater/index.js';

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
        API.events.calendar.on('create',onCreate)
        API.events.calendar.on('delete',onDelete)
        API.events.calendar.on('update',onUpdate);
        function onCreate(item:ApiItem<ItemEvCalendar> | null){
            if(item){
                setEvents(e =>[...e,item]);
            }
        }
        function onDelete(item:ApiItem<ItemEvCalendar> | null){
            if(item){
                setEvents(e =>e.filter((act)=>act != item));
            }else{
                API.events.calendar().then(e =>{
                    setEvents([...e.list]);
                })
            }
        }
        function onUpdate(){
            API.events.calendar().then(e =>{
                setEvents([...e.list]);
            })
        }
        return ()=>{
            API.events.calendar.off('update',onUpdate);
            API.events.calendar.off('delete',onDelete);
            API.events.calendar.off('create',onCreate);
        }
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