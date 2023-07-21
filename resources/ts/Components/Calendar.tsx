import { CalendarEvent, CalendarEventContext } from "../contexts.js";
import {RefObject, createRef, useContext,useEffect,useState} from 'react'

interface DayInfoWithEvents{
    day:number
    inMonth:boolean
    selected?:boolean
    /**Show the events in day */
    events:CalendarEvent[]
}
const days = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sabádo"]
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
function Day({dayInfo}:{dayInfo:DayInfoWithEvents}){
    const {day:d,inMonth:inM = true,selected = false} = dayInfo
    const put = d > 9 ? ''+d : '0'+d;
    let className = 'cl-day ' + (inM ? 'cl-in':'cl-off');
    let classSub =(selected ? "cl-sel": '') + (dayInfo.events.length > 0 ? ' cl-evs' : '');
    return (
        <td className={className}>
            <div className={classSub}>
            {put}
            </div>
        </td>
    )
}
function getMonth(month:number,year:number){
    month --;
    var laster = new Date(year, month + 1, 1);
    laster.setDate(laster.getDate() - 1);
    var first = new Date(year,month,1);
    return [laster.getDate(),first.getDay()];
}
//TODO make new system to pass if the select day is in actual month or in the before/next month
function getMonthData(month:number,year:number,selected?:number,events?:CalendarEvent[]){
    let monthInfo = getMonth(month,year);
    let before = getMonth(month == 1 ? 12 : month -1,year)[0] - monthInfo[1];
    let evs = events || [];
    let weeks:DayInfoWithEvents[][] = [];
    let startCounting = false;
    let actualDay = 1;
    let week:DayInfoWithEvents[] =[]
    let nexter = 1;

    for(let act =0; act < 7;act++){
        if(monthInfo[1] === act){
            startCounting = true;
        }
        if(startCounting){
            addDayToWeek(actualDay,true);
            actualDay++;
            continue;
        }
        before++;
        addDayToWeek(before,false);
    }
    weeks.push(week);
    for(let actWeek = 0;actWeek < 5;actWeek++){
        week = [];
        for(let act = 0; act < 7; act++){
            if(actualDay <= monthInfo[0]){
                addDayToWeek(actualDay,true)
                actualDay++;
            }else{
                addDayToWeek(nexter,false)
                nexter++;
            }
        }
        weeks.push(week);
    }
    return weeks;
    function addDayToWeek(day:number,inMonth:boolean){
        let actSelected = inMonth ? day === selected : false;
        let evsFromDay:CalendarEvent[] =inMonth ? evs.filter(({date}) =>date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) : []
        let obj:DayInfoWithEvents ={
            day,
            inMonth,
            selected: actSelected,
            events:evsFromDay
        }
        week.push(obj);
    }
}
export default function Calendar({month,year,selected, showTop=true}:{month:number,year:number,selected?:number,showTop?:boolean}){
    let [date,setDate] = useState({month,year});
    let {events} = useContext(CalendarEventContext)
    let [weeks,setWeeks] = useState(getMonthData(month,year,selected,events))
    function updCalendar(make:'add'|'rem'){
        let date =updMonth(make);
        setWeeks(getMonthData(date.month,date.year,(date.month == month && date.year == year ? selected:undefined),events));
    }
    function updMonth(make:'add'|'rem'){
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
    return (
        <div className="cl-content">
            <div className="cl-top">
                <div className="cl-btn cl-before" onClick={(ev)=>{updCalendar('rem')}}>{'<'}</div>
                <div className="cl-title">{months[date.month - 1] + ' '+date.year}</div>
                <div className="cl-btn cl-after" onClick={(ev)=>{updCalendar('add')}} >{'>'}</div>
            </div>
            <table className="cl">
                <thead className="cl-days">
                    <tr>
                        {days.map((e,i) =>{
                            //TODO make system to only show first letter when portrait or low width
                            return <th key={'cl-d-'+i}>{e}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map(
                        (act,ind) => (
                        <tr key={'t'+ind}>
                            {act.map(
                                (info)=> <Day key={'c'+info.day + ind} dayInfo={info}></Day>)}
                        </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    )
}
