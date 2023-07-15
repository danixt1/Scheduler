import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarEventContext } from "../contexts.js";
import { useContext, useState } from 'react';
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function Day({ dayInfo }) {
    const { day: d, inMonth: inM = true, selected = false } = dayInfo;
    const put = d > 9 ? '' + d : '0' + d;
    let className = 'cl-day ' + (inM ? 'cl-in' : 'cl-off');
    return (_jsx("td", { className: className, children: selected ? _jsx("div", { className: "cl-sel", children: put }) : put }));
}
function getMonth(month, year) {
    month--;
    var laster = new Date(year, month + 1, 1);
    laster.setDate(laster.getDate() - 1);
    var first = new Date(year, month, 1);
    return [laster.getDate(), first.getDay()];
}
function getMonthData(month, year, selected) {
    let monthInfo = getMonth(month, year);
    let before = getMonth(month == 1 ? 12 : month - 1, year)[0] - monthInfo[1];
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
            week.push({ day: actualDay, inMonth: true, selected: actualDay === selected });
            actualDay++;
            continue;
        }
        before++;
        week.push({ day: before, inMonth: false });
    }
    weeks.push(week);
    for (let actWeek = 0; actWeek < 5; actWeek++) {
        week = [];
        for (let act = 0; act < 7; act++) {
            if (actualDay <= monthInfo[0]) {
                week.push({ day: actualDay, inMonth: true, selected: actualDay === selected });
                actualDay++;
            }
            else {
                week.push({ day: nexter, inMonth: false, selected: actualDay === selected });
                nexter++;
            }
        }
        weeks.push(week);
    }
    return weeks;
}
export default function Calendar({ month, year, selected, showTop = true }) {
    let [date, setDate] = useState({ month, year });
    let [weeks, setWeeks] = useState(getMonthData(month, year, selected));
    let { setEvents } = useContext(CalendarEventContext);
    function updCalendar(make) {
        let date = updMonth(make);
        setWeeks(getMonthData(date.month, date.year, (date.month == month && date.year == year ? selected : undefined)));
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
    return (_jsxs("div", { className: "cl-content", children: [_jsxs("div", { className: "cl-top", children: [_jsx("div", { className: "cl-btn cl-before", onClick: (ev) => { updCalendar('rem'); }, children: '<' }), _jsx("div", { className: "cl-title", children: months[date.month - 1] + ' ' + date.year }), _jsx("div", { className: "cl-btn cl-after", onClick: (ev) => { updCalendar('add'); }, children: '>' })] }), _jsxs("table", { className: "cl", children: [_jsx("thead", { className: "cl-days", children: _jsxs("tr", { children: [_jsx("th", { children: "Domingo" }), _jsx("th", { children: "Segunda" }), _jsx("th", { children: "Ter\u00E7a" }), _jsx("th", { children: "Quarta" }), _jsx("th", { children: "Quinta" }), _jsx("th", { children: "Sexta" }), _jsx("th", { children: "Sab\u00E1do" })] }) }), _jsx("tbody", { children: weeks.map((act, ind) => (_jsx("tr", { children: act.map((info) => _jsx(Day, { dayInfo: info }, 'c' + info.day + ind)) }, 't' + ind))) })] })] }));
}
