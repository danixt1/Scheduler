import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarEventContext } from "../contexts.js";
import { useContext, useState } from 'react';
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function Day({ d, inM = true }) {
    const put = d > 9 ? '' + d : '0' + d;
    let className = 'cl-day ' + (inM ? 'cl-in' : 'cl-off');
    return (_jsx("td", { className: className, children: put }));
}
function getMonth(month, year) {
    month--;
    var laster = new Date(year, month + 1, 1);
    laster.setDate(laster.getDate() - 1);
    var first = new Date(year, month, 1);
    return [laster.getDate(), first.getDay()];
}
function getMonthData(month, year) {
    let monthInfo = getMonth(month, year);
    let before = getMonth(month == 1 ? 12 : month - 1, year)[0];
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
            week.push({ day: actualDay, inMonth: true });
            actualDay++;
            continue;
        }
        week.push({ day: before, inMonth: false });
        before--;
    }
    weeks.push(week);
    for (let actWeek = 0; actWeek < 5; actWeek++) {
        week = [];
        for (let act = 0; act < 7; act++) {
            if (actualDay <= monthInfo[0]) {
                week.push({ day: actualDay, inMonth: true });
                actualDay++;
            }
            else {
                week.push({ day: nexter, inMonth: false });
                nexter++;
            }
        }
        weeks.push(week);
    }
    return weeks;
}
function renderMonth(weeks) {
    return weeks.map((act, ind) => (_jsx("tr", { children: act.map(({ day, inMonth }) => _jsx(Day, { d: day, inM: inMonth }, 'c' + day + ind)) }, 't' + ind)));
}
export default function Calendar({ month, year, selected, showTop = true }) {
    let [weeks, setWeeks] = useState(getMonthData(month, year));
    let { setEvents } = useContext(CalendarEventContext);
    function updCalendar(month) {
    }
    function updMonth(nextVal) {
        // TODO make month/year updater
    }
    return (_jsxs("div", { className: "cl-content", children: [_jsxs("div", { className: "cl-top", children: [_jsx("div", { className: "cl-btn cl-before", children: '<' }), _jsx("div", { className: "cl-title", children: months[month - 1] + ' ' + year }), _jsx("div", { className: "cl-btn cl-after", children: '>' })] }), _jsxs("table", { className: "cl", children: [_jsx("thead", { className: "cl-days", children: _jsxs("tr", { children: [_jsx("th", { children: "Domingo" }), _jsx("th", { children: "Segunda" }), _jsx("th", { children: "Ter\u00E7a" }), _jsx("th", { children: "Quarta" }), _jsx("th", { children: "Quinta" }), _jsx("th", { children: "Sexta" }), _jsx("th", { children: "Sab\u00E1do" })] }) }), _jsx("tbody", { children: renderMonth(weeks) })] })] }));
}
