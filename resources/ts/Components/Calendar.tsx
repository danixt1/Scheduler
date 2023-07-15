import { CalendarEvent, CalendarEventContext } from "../contexts.js";
import {useContext,useState} from 'react'
interface DayInfo{
    day:number
    inMonth:boolean
    selected?:boolean
}
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
function Day({dayInfo}:{dayInfo:DayInfo}){
    const {day:d,inMonth:inM = true,selected = false} = dayInfo
    const put = d > 9 ? ''+d : '0'+d;
    let className = 'cl-day ' + (inM ? 'cl-in':'cl-off');
    return (
        <td className={className}>
            {selected ? <div className="cl-sel">{put}</div> : put}
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
function getMonthData(month:number,year:number,selected?:number){
    let monthInfo = getMonth(month,year);
    let before = getMonth(month == 1 ? 12 : month -1,year)[0] - monthInfo[1];

    let weeks:DayInfo[][] = [];
    let startCounting = false;
    let actualDay = 1;
    let week:DayInfo[] =[]
    let nexter = 1;

    for(let act =0; act < 7;act++){
        if(monthInfo[1] === act){
            startCounting = true;
        }
        if(startCounting){
            week.push({day:actualDay,inMonth:true,selected:actualDay === selected})
            actualDay++;
            continue;
        }
        before++;
        week.push({day:before,inMonth:false})
    }
    weeks.push(week);
    for(let actWeek = 0;actWeek < 5;actWeek++){
        week = [];
        for(let act = 0; act < 7; act++){
            if(actualDay <= monthInfo[0]){
                week.push({day:actualDay,inMonth:true,selected:actualDay === selected})
                actualDay++;
            }else{
                week.push({day:nexter,inMonth:false,selected:actualDay === selected})
                nexter++;
            }
        }
        weeks.push(week);
    }
    return weeks;
}
export default function Calendar({month,year,selected, showTop=true}:{month:number,year:number,selected?:number,showTop?:boolean}){
    let [date,setDate] = useState({month,year});
    let [weeks,setWeeks] = useState(getMonthData(month,year,selected))
    let {setEvents} = useContext(CalendarEventContext)
    function updCalendar(make:'add'|'rem'){
        let date =updMonth(make);
        setWeeks(getMonthData(date.month,date.year,(date.month == month && date.year == year ? selected:undefined)));
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
                        <th>Domingo</th>
                        <th>Segunda</th>
                        <th>Terça</th>
                        <th>Quarta</th>
                        <th>Quinta</th>
                        <th>Sexta</th>
                        <th>Sabádo</th>
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
