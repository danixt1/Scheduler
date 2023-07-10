import axios, { AxiosStatic } from 'axios';
import { createRoot } from 'react-dom/client';
import React,{ StrictMode } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import '../css/app.css'
declare global{
    interface Window{axios:AxiosStatic}
}
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob('./Pages/**/*.js', { eager: true })
    return pages[`./Pages/${name}.js`]
  },
  setup({ el, App, props }:{el:Element,App:new()=>React.Component,props:any}) {
    createRoot(el).render(
      <StrictMode>
        <App {...props} />
      </StrictMode>
    )
  },
})
