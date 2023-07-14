import { createContext } from 'react';
export interface CalendarEvent{
    title:string
    desc?:string
    date:{y:number,m:number,d:number}
    hour:number
    minutes:number
}
interface ContextInterface{
    events:CalendarEvent[]
    setEvents:React.Dispatch<React.SetStateAction<CalendarEvent[]>>
}
export const CalendarEventContext = createContext(<ContextInterface>{
    events:[],
    setEvents:()=>{}
})