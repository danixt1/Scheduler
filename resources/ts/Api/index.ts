import { ApiRouting } from "./Api"
import { buildApi } from "./Conector"
import { ApiItems } from "./Items"

function dateInput(prop:Date | string){
    if(typeof prop=== 'string'){
        return {value:prop}
    }
    return {value:prop.toUTCString()}
}
function dateOutput(prop:string){
    return new Date(prop + ' UTC');
}
let mainRoutes = buildApi({
    senders:'sender',
    locations:'location'
})
let eventsRoutes = buildApi({
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

window.api =<ApiRouting<ApiItems>> mainRoutes;

export const API = <ApiRouting<ApiItems>> mainRoutes;
