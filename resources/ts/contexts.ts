import { createContext } from 'react';
export interface CalendarEvent{
    title:string
    desc:string
    date:Date
    type:"reminder"
}
interface ContextInterface{
    events:CalendarEvent[]
    setEvents:React.Dispatch<React.SetStateAction<CalendarEvent[]>>
}
export const CalendarEventContext = createContext(<ContextInterface>{
    events:[],
    setEvents:()=>{}
})