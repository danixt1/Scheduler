import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { CalendarEventContext } from "../contexts.js";
//import "../../css/eventList.css"
function EventItem({ ev, monthMode }) {
    const { title, date, hour, minutes, desc } = ev;
    let description = desc || '';
    return (_jsxs("div", { className: "eventItem", children: [_jsx("div", { className: "ev-title", children: title }), _jsxs("div", { className: "ev-day-hour", children: [_jsx("div", { children: monthMode ? "Dia " + date.d : `${date.y}/${date.m}/${date.d}` }), _jsx("div", { children: `${hour}:${minutes}` })] }), _jsx("div", { className: "ev-desc", children: description })] }));
}
export function EventsList({ monthMode = true }) {
    const { events } = useContext(CalendarEventContext);
    console.log(events);
    return (_jsx("div", { className: "itemList", children: events.map((e, n) => _jsx(EventItem, { ev: e, monthMode: monthMode }, 'EvIt' + n + '-' + Math.random().toFixed(8))) }));
}
