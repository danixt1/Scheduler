import { ApiRouting } from "./Api"
import { buildApi } from "./Conector"
import { ApiItems } from "./Items"
const BASE_URL = '/api/v1/';
function dateInput(prop:Date | string){
    if(typeof prop=== 'string'){
        return {value:prop}
    }
    return {value:prop.toUTCString()}
}
function dateOutput(prop:string){
    return new Date(prop + ' UTC');
}
let mainRoutes =<any>buildApi({url:BASE_URL},{
    senders:'sender',
    locations:'location'
})
let eventsRoutes = buildApi({url:BASE_URL},{
    'events/data':'data',
    'events/calendar':{
        name:'calendar',
        output:{
            date:dateOutput
        },
        input:{
            date:dateInput
        },
        ref:['timer','event','sender']
    },
    'events/timers':{
        name:'timer',
        output:{
            date:dateOutput
        },
        input:{
            date:dateInput
        },
        ref:['data','sender']
    }
})
declare global{
    interface Window{
        api:ApiRouting<ApiItems>
    }
}
mainRoutes.events = eventsRoutes;
if(typeof window === 'object'){
    window.api =<ApiRouting<ApiItems>> mainRoutes;
}

export const API = <ApiRouting<ApiItems>> mainRoutes;
