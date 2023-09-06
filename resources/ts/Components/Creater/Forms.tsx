import { useContext } from "react";
import { useForm } from "react-hook-form";
import { API } from "../../Api";
import { CalendarEventContext } from "../../contexts";
import { SelectWithApiData, InputZone } from "./Inputs";

interface Sender{
    name:string,
    id:number
}
interface CloseWindow{
    close(a:boolean):void
}
interface TimedEvent{
    sender_id:number
    date:string
}
interface CreatingEvent extends TimedEvent{
    eventName:string
    eventDesc:string
}
export type FormBuilder = React.HTMLAttributes<HTMLFormElement> & CloseWindow;

export function FormEvent({close,...props}:FormBuilder){
    let {setEvents} = useContext(CalendarEventContext);
    const {register,handleSubmit} = useForm<CreatingEvent>();
        function onSubmit(t:CreatingEvent){
        API.events.calendar({
            type:1,
            data:{
                name:t.eventName,
                description:t.eventDesc || ''
            },
            date:new Date(t.date),
            sender_id:t.sender_id
        }).then((e)=>{
            close(true);
            setEvents(evs =>[...evs,e]);
        })
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} {...props}>
            <h1>Novo Evento</h1>
            <SelectWithApiData title="Enviar para" 
                register={register('sender_id',{required:true,valueAsNumber:true})} reqTo={API.sender}
                show={(e:Sender)=>{return e.name}}/>
            <button>Criar novo Sender</button>
            <InputZone register={register('eventName',{required:true})} title="Nome" type="text"/>
            <InputZone register={register('eventDesc',{required:false})} title="Descrição" type="text"/>
            <InputZone register={register('date',{required:true})} title="Data" type="datetime-local"/>
            <input type="submit" value="Salvar Evento"/>
        </form>
    )
}
export function FormLocation({close,...props}:FormBuilder){
    function onSubmit(){

    }
    return (
        <form>

        </form>
    )
}
export function FormSender(){

}