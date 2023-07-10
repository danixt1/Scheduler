import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Head } from '@inertiajs/react';
import Calendar from '../Components/Calendar.js';
export default function App() {
    return (_jsxs("div", { children: [_jsx(Head, { title: "Testing" }), _jsx("h2", { children: "Testando" }), _jsx(Calendar, { month: 2, year: 2023 })] }));
}
