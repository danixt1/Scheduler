import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarEventContext } from "../contexts.js";
import { useContext, useState } from 'react';
const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabádo"];
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function Day({ dayInfo }) {
    const { day: d, inMonth: inM = true, selected = false } = dayInfo;
    const put = d > 9 ? '' + d : '0' + d;
    let className = 'cl-day ' + (inM ? 'cl-in' : 'cl-off');
    let classSub = (selected ? "cl-sel" : '') + (dayInfo.events.length > 0 ? ' cl-evs' : '');
    return (_jsx("td", { className: className, children: _jsx("div", { className: classSub, children: put }) }));
}
function getMonth(month, year) {
    month--;
    var laster = new Date(year, month + 1, 1);
    laster.setDate(laster.getDate() - 1);
    var first = new Date(year, month, 1);
    return [laster.getDate(), first.getDay()];
}
//TODO make new system to pass if the select day is in actual month or in the before/next month
function getMonthData(month, year, selected, events) {
    let monthInfo = getMonth(month, year);
    let before = getMonth(month == 1 ? 12 : month - 1, year)[0] - monthInfo[1];
    let evs = events || [];
    let weeks = [];
    let startCounting = false;
    let actualDay = 1;
    let week = [];
    let nexter = 1;
    for (let act = 0; act < 7; act++) {
        if (monthInfo[1] === act) {
            startCounting = true;
        }
        if (startCounting) {
            addDayToWeek(actualDay, true);
            actualDay++;
            continue;
        }
        before++;
        addDayToWeek(before, false);
    }
    weeks.push(week);
    for (let actWeek = 0; actWeek < 5; actWeek++) {
        week = [];
        for (let act = 0; act < 7; act++) {
            if (actualDay <= monthInfo[0]) {
                addDayToWeek(actualDay, true);
                actualDay++;
            }
            else {
                addDayToWeek(nexter, false);
                nexter++;
            }
        }
        weeks.push(week);
    }
    return weeks;
    function addDayToWeek(day, inMonth) {
        let actSelected = inMonth ? day === selected : false;
        let evsFromDay = inMonth ? evs.filter(({ date }) => date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) : [];
        let obj = {
            day,
            inMonth,
            selected: actSelected,
            events: evsFromDay
        };
        week.push(obj);
    }
}
export default function Calendar({ month, year, selected, showTop = true }) {
    let [date, setDate] = useState({ month, year });
    let { events } = useContext(CalendarEventContext);
    let [weeks, setWeeks] = useState(getMonthData(month, year, selected, events));
    function updCalendar(make) {
        let date = updMonth(make);
        setWeeks(getMonthData(date.month, date.year, (date.month == month && date.year == year ? selected : undefined), events));
    }
    function updMonth(make) {
        var op = make === 'add' ? 1 : -1;
        let newMonth = date.month + op;
        let actualSetter;
        if (newMonth > 12) {
            actualSetter = { month: 1, year: ++date.year };
            setDate(actualSetter);
            return actualSetter;
        }
        ;
        if (newMonth < 1) {
            actualSetter = { month: 12, year: --date.year };
            setDate(actualSetter);
            return actualSetter;
        }
        ;
        actualSetter = { month: newMonth, year: date.year };
        setDate(actualSetter);
        return actualSetter;
    }
    return (_jsxs("div", { className: "cl-content", children: [_jsxs("div", { className: "cl-top", children: [_jsx("div", { className: "cl-btn cl-before", onClick: (ev) => { updCalendar('rem'); }, children: '<' }), _jsx("div", { className: "cl-title", children: months[date.month - 1] + ' ' + date.year }), _jsx("div", { className: "cl-btn cl-after", onClick: (ev) => { updCalendar('add'); }, children: '>' })] }), _jsxs("table", { className: "cl", children: [_jsx("thead", { className: "cl-days", children: _jsx("tr", { children: days.map((e, i) => {
                                //TODO make system to only show first letter when portrait or low width
                                return _jsx("th", { children: e }, 'cl-d-' + i);
                            }) }) }), _jsx("tbody", { children: weeks.map((act, ind) => (_jsx("tr", { children: act.map((info) => _jsx(Day, { dayInfo: info }, 'c' + info.day + ind)) }, 't' + ind))) })] })] }));
}
