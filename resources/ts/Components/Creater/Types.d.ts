import { UseFormReturn } from "react-hook-form"
import { ApiItem, FuncApi } from "../../Api/Api"
import { ReactNode } from "react"
/**
 * Object containing informations from react hook and infos from the actual form and the location to send
 */
export interface FormData<FORM_INFO extends Record<string, any>> extends UseFormReturn<FORM_INFO,any,any>{
    api:FuncApi<any,any>
    /** Used to determine if object is hidden */
    name:string
    displayName:string
    /** Started after submit validated,
     *  pass the data extracted from the form and expect the processed object to be sended to server */
    processing:(data:any)=>Promise<any> | any
}
export interface Sender{
    name:string
    id:number
}
export interface CreatingSender extends Sender{
    name:string
    locations:{value:string}[]
}
export interface CreatingLocation extends LocationHttpRequest{
    name:string
}
export interface LocationHttpRequest{
    /** Url */
    u:string
    m:string
    h:{[index:string]:string}
}
export type CreatingLocationHttpRequest = Omit<LocationHttpRequest,'h'> & {h:Array<{name:string,value:string}>};

export interface TimedEvent{
    sender_id:number
    date:string
}
export interface CreatingEvent extends TimedEvent{
    id?:string
    eventName:string
    eventDesc:string
}
/**
 * Basic type to all Forms
 */
export type FormBuilder<IT> = React.HTMLAttributes<HTMLFormElement> & {apiItem?:ApiItem<IT>};
export interface BaseFormAttrs extends React.HTMLAttributes<HTMLElement>{
    data:FormData<any>
    /** Pass the apiItem to enter in edit mode */
    apiItem?:ApiItem<Record<any,any>>
    children:ReactNode,
    disableSubmit?:boolean
};
export interface FormWithListAttrs{
    name:string
    apiItem?:ApiItem<Record<any,any>>
    list():ReactNode
    form(data:FormBuilder<any>):ReactNode
}