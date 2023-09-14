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
axios.defaults.maxRate = 3;
createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }:{el:Element,App:any,props:any}) {
    document.body.className = 'light'
    createRoot(el).render(
      <StrictMode>
        <App {...props} />
      </StrictMode>
    )
  },
})
