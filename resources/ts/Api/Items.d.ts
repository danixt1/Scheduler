import { Item,ApiRef, genericEntry } from "./Api"
export interface ItemSender extends Item{
    name:string
}

export interface ItemLocation extends Item{
    type:number
    name:string
    data:any
}
export interface ItemEvData extends Item{
    type:number,
    data:{
        name:string,
        description:string
    }
}
export interface ItemEvTimers extends Item{
    date:Date
    data:ApiRef<ItemEvData>
    sender:ApiRef<ItemSender>
}
export interface ItemEvCalendar extends ItemEvData{
    get date():Date
    set date(value:Date | string)

    get timer():ApiRef<ItemEvTimers>
    set timer(value:number)

    get event():ApiRef<ItemEvData>
    set event(value:number)
    get sender():ApiRef<ItemSender>
    set sender(val:number)
}
export interface ItemLocSender extends Item{
    get location():ApiRef<ItemLocation>
    set location(value:number)

    get sender():ApiRef<ItemSender>
    set sender(value:number)

    isFallback:boolean
}
export interface ApiItems{
    sender:[ItemSender,genericEntry<ItemSender & {ids:number[]}>]
    location:ItemLocation,
    locSender:ItemLocSender,
    events:{
        data:ItemEvData
        calendar:[ItemEvCalendar,genericEntry<Omit<ItemEvCalendar,'timer'|'event'|'sender'> & {sender_id:number}>]
        timer:ItemEvTimers
    }
}