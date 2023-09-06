import {Children, ReactNode, RefObject, createRef, useContext,useEffect,useState} from 'react'
import { CalendarEventContext } from '../contexts'
import { ApiItem } from '../Api/Api'
import { ItemEvCalendar } from '../Api/Items'

interface DayInfoWithEvents{
    day:number
    inMonth:boolean
    selected?:boolean
    /**Show the events in day */
    events:ApiItem<ItemEvCalendar>[]
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
function getMonthData(month:number,year:number,selected:number | null = null,events:ApiItem<ItemEvCalendar>[]){
    let monthInfo = getMonth(month,year);
    let before = getMonth(month,year)[0] - monthInfo[1];
    let evs = events.filter(e => e.date.getMonth() + 1 === month && e.date.getFullYear() === year);
    
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
        let evsFromDay:ApiItem<ItemEvCalendar>[] =inMonth ? evs.filter(({date}) =>date.getDate() === day) : []
        let obj:DayInfoWithEvents ={
            day,
            inMonth,
            selected: actSelected,
            events:evsFromDay
        }
        week.push(obj);
    }
}
export default function Calendar({month,year,selected = null, showTop=true,children = []}:{month:number,year:number,selected?:number | null,showTop?:boolean,children:ReactNode}){
    let [date,setDate] = useState({month,year});
    let {events} = useContext(CalendarEventContext)
    let [weeks,setWeeks] = useState(getMonthData(month,year,selected,[]))
    useEffect(()=>{
        setWeeks(getMonthData(month,year,selected,events));
    },[events,month,year]);
    return (
        <div className="cl-content">
            <div className="cl-top">
                {children}
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
