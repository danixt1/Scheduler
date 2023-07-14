import { CalendarEvent, CalendarEventContext } from "../contexts.js";
import {useContext,useState} from 'react'
interface DayInfo{
    day:number
    inMonth:boolean
}
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
function Day({d,inM = true}:{d:number,inM?:boolean}){
    const put = d > 9 ? ''+d : '0'+d;
    let className = 'cl-day ' + (inM ? 'cl-in':'cl-off')
    return (
        <td className={className}>
            {put}
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
function getMonthData(month:number,year:number){
    let monthInfo = getMonth(month,year);
    let before = getMonth(month == 1 ? 12 : month -1,year)[0];

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
            week.push({day:actualDay,inMonth:true})
            actualDay++;
            continue;
        }
        week.push({day:before,inMonth:false})
        before--;
    }
    weeks.push(week);
    for(let actWeek = 0;actWeek < 5;actWeek++){
        week = [];
        for(let act = 0; act < 7; act++){
            if(actualDay <= monthInfo[0]){
                week.push({day:actualDay,inMonth:true})
                actualDay++;
            }else{
                week.push({day:nexter,inMonth:false})
                nexter++;
            }
        }
        weeks.push(week);
    }
    return weeks;
}
function renderMonth(weeks:DayInfo[][]){
    return weeks.map(
        (act,ind) => (
        <tr key={'t'+ind}>
            {act.map(({day,inMonth})=> <Day key={'c'+day + ind} d={day} inM={inMonth}></Day>)}
        </tr>
        )
    )
}
export default function Calendar({month,year,selected, showTop=true}:{month:number,year:number,selected?:number,showTop?:boolean}){
    let [weeks,setWeeks] = useState(getMonthData(month,year))
    let {setEvents} = useContext(CalendarEventContext)
    function updCalendar(month:number){

    }
    function updMonth(nextVal:number){
        // TODO make month/year updater
    }
    return (
        <div className="cl-content">
            <div className="cl-top">
                <div className="cl-btn cl-before">{'<'}</div>
                <div className="cl-title">{months[month - 1] + ' '+year}</div>
                <div className="cl-btn cl-after">{'>'}</div>
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
                    {
                        renderMonth(weeks)
                    }
                </tbody>
            </table>
        </div>
    )
}
