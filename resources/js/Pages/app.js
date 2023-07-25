import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Head } from '@inertiajs/react';
import Calendar from '../Components/Calendar.js';
import { CalendarEventContext } from '../contexts.js';
import { EventsList } from '../Components/EventsList.js';
import { useState } from 'react';
import Creater from '../Components/Creater.js';
export default function App({ errors, events: _evs }) {
    let evs = [];
    _evs.map(e => {
        evs.push({
            date: new Date(e.date + ' UTC'),
            desc: e.desc,
            title: e.name,
            type: e.type
        });
    });
    let [events, setEvents] = useState(evs);
    let eventer = { events, setEvents };
    return (_jsxs(_Fragment, { children: [_jsx(Head, { title: "Testing" }), _jsx("div", { style: { position: 'absolute', width: '100%', height: '100%' }, className: 'app-twoParts', children: _jsxs(CalendarEventContext.Provider, { value: eventer, children: [_jsx(Creater, {}), _jsx("div", { className: 'app-pt1', children: _jsx(EventsList, {}) }), _jsx("div", { className: 'app-pt2', children: _jsx(Calendar, { month: 2, year: 2023, showTop: false, selected: 1 }) })] }) })] }));
}
