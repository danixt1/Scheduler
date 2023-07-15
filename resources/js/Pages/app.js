import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Head } from '@inertiajs/react';
import Calendar from '../Components/Calendar.js';
import { useState } from 'react';
export default function App() {
    let ev = {
        date: { y: 2023, m: 2, d: 2 },
        hour: 22,
        minutes: 30,
        title: "Evento de teste",
        desc: "Eventos simples para testar o funcionamento dessa"
    };
    let ev2 = {
        date: { y: 2023, m: 2, d: 2 },
        hour: 22,
        minutes: 30,
        title: "Mais um evento para fazer o teste eee",
        desc: "Outro evento"
    };
    let ev3 = {
        date: { y: 2025, m: 6, d: 2 },
        hour: 22,
        minutes: 30,
        title: "Outro pra ver",
        desc: "Outro evento"
    };
    let [events, setEvents] = useState([ev, ev2, ev3]);
    let eventer = { events, setEvents };
    return (_jsxs(_Fragment, { children: [_jsx(Head, { title: "Testing" }), _jsx("div", { style: { position: 'absolute', width: '100%', height: '100%' }, children: _jsx(Calendar, { month: 2, year: 2023, showTop: false, selected: 28 }) })] }));
}
