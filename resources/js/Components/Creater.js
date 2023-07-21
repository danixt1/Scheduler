import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CreaterUsingButton() {
    return (_jsx("div", { className: "cr-create-btn", children: _jsx("div", { children: "+" }) }));
}
function CreaterWindow() {
    return (_jsx("div", { className: "cr-backwindow", children: _jsx("div", { className: "cr-window", children: _jsxs("div", { children: [_jsx("h3", { children: "Senders" }), _jsx("div", {}), _jsx("button", { children: "Criar novo Sender" })] }) }) }));
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
