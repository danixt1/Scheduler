import { createContext } from 'react';
import { ApiItem } from './Api/Api';
import { ItemEvCalendar } from './Api/Items';

interface ContextInterface{
    events:ApiItem<ItemEvCalendar>[]
    setEvents:React.Dispatch<React.SetStateAction<ApiItem<ItemEvCalendar>[]>>
}
export const CalendarEventContext = createContext(<ContextInterface>{
    events:[],
    setEvents(evs){}
})