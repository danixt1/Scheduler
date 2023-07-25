import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import axios from "axios";
import { useEffect, useState } from "react";
export function CreaterUsingButton() {
    return (_jsx("div", { className: "cr-create-btn", children: _jsx("div", { children: "+" }) }));
}
function BaseInput({ title, children, ...props }) {
    return (_jsxs("div", { className: "cr-box-input", ...props, children: [_jsx("div", { className: "cr-data-title", children: title }), _jsx("div", { className: "cr-data-input", children: children })] }));
}
function InputZone({ title, name, type = 'text', value }) {
    return (_jsx(BaseInput, { title: title, children: _jsx("input", { type: type, name: name, value: value || '' }) }));
}
function CreaterWindow() {
    let [inLoad, setInLoad] = useState(true);
    let [senderList, setSenderList] = useState([]);
    useEffect(() => {
        axios.get('/api/sender').then(e => {
            setSenderList(e.data);
            setInLoad(false);
        });
    }, []);
    return (_jsx("div", { className: "cr-backwindow", children: _jsx("div", { className: "cr-window", children: _jsxs("div", { className: "cr-forms", children: [_jsx("h1", { children: "Novo Evento" }), _jsxs("div", { className: "cr-senders", children: [_jsx("div", { hidden: !inLoad, children: "Carregando..." }), _jsx(BaseInput, { title: "Enviar para:", hidden: inLoad, children: _jsx("select", { name: "sender", children: senderList.map((e, i) => {
                                        return _jsx("option", { children: e.name }, 'cr-' + i);
                                    }) }) }), _jsx("button", { children: "Criar novo Sender" })] }), _jsx(InputZone, { name: "eventName", title: "Nome Do Evento" }), _jsx(InputZone, { name: "description", title: "Descri\u00E7\u00E3o" }), _jsx(InputZone, { name: "eventDate", title: "Data", type: "date" }), _jsx("button", { children: "Salvar Evento" })] }) }) }));
}
function L_Reminder() {
    return (_jsxs("div", { children: [_jsx("input", { type: "text", name: "url" }), _jsxs("select", { name: "method", id: "", children: [_jsx("option", { value: "GET", children: "GET" }), _jsx("option", { value: "POST", children: "POST" })] })] }));
}
function Sender() {
    return (_jsx("div", {}));
}
export default function Creater() {
    return (_jsxs("div", { children: [_jsx(CreaterWindow, {}), _jsx(CreaterUsingButton, {})] }));
}
