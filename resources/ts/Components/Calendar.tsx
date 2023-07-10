import React from 'react';

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
export default function Calendar({month,year,selected}:{month:number,year:number,selected?:number}){
    let monthInfo = getMonth(month,year);
    let nexMonth = getMonth(month == 12 ? 1 : month + 1,year)[0];
    let before = getMonth(month == 1 ? 12 : month -1,year)[0];
    let weeks:{day:number,inMonth:boolean}[][] = [];
    let startCounting = false;
    let actualDay = 1;
    let week:{day:number,inMonth:boolean}[] =[]
    let nexter = 1;
    //Render first week 6
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
    //Last Week

    return (
        <table className="calendar">
            <thead>
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
                    weeks.map((act,ind) =><tr key={'t'+ind}>
                        {act.map(e => <Day key={'c'+e.day + ind + month} d={e.day} inM={e.inMonth}></Day>)}
                    </tr>)
                }
            </tbody>
        </table>
    )
}