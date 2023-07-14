import { createContext } from 'react';
export const CalendarEventContext = createContext({
    events: [],
    setEvents: () => { }
});
