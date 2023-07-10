import { jsx as _jsx } from "react/jsx-runtime";
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import '../css/app.css';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.js', { eager: true });
        return pages[`./Pages/${name}.js`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(_jsx(StrictMode, { children: _jsx(App, { ...props }) }));
    },
});
