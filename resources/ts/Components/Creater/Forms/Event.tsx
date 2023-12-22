import { useContext, useState, useEffect } from "react";
import { API } from "../../../Api";
import { ItemEvCalendar } from "../../../Api/Items";
import { CalendarEventContext } from "../../../contexts";
import { CloseWindownContext } from "../Ctxs";
import { SelectWithApiData, InputZone } from "../Inputs";
import { FormBuilder, CreatingEvent, Sender } from "../Types";
import { BaseForm,formBuilder } from "./Base";

export function FormEvent({...props}:FormBuilder<ItemEvCalendar>){
    let {setEvents} = useContext(CalendarEventContext);
    let close = useContext(CloseWindownContext);
    let defValues:any = undefined;

    if(props.apiItem){
        let item = props.apiItem;
        let date = item.date;
        let dateStr = (new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()).slice(0, -8);
        
        defValues = {
            date:dateStr,
            eventName:item.data.name,
            eventDesc:item.data.description
        }
    }
    
    let data = formBuilder<CreatingEvent>('event','Evento',processing,API.events.calendar,defValues);

    let [haveSenders,setHaveSender] = useState(null as null | boolean);
    let [disableSubmit,setDisableSubmit] = useState(true);
    const {register,setValue} = data;
    
    function processing(t:CreatingEvent){
        return {
            id:t.id,
            type:1,
            data:{
                name:t.eventName,
                description:t.eventDesc || ''
            },
            date:new Date(t.date),
            sender_id:t.sender_id
        }
    }
    function inPrms(request:Promise<any>){
        request.then(e =>{
            if(!props.apiItem){
                setHaveSender(e.list.length != 0);
            }
            setDisableSubmit(false);
        })
    }
    function updHaveSender(){
        setHaveSender(true);
    }
    useEffect(()=>{
        API.sender.on('create',updHaveSender);
        return ()=>{
            API.sender.off('create',updHaveSender);
        }
    },[])
    return (
        <BaseForm  {...props} data={data} disableSubmit = {haveSenders != null ? !haveSenders : disableSubmit}>
            <SelectWithApiData title="Enviar para" 
                register={register('sender_id',{required:true,valueAsNumber:true})} 
                reqTo={API.sender}
                inRequest={inPrms}
                setDefValue={props.apiItem ? ()=>{setValue('sender_id',props.apiItem!.sender.id)} : undefined}
                show={(e:Sender)=>{return e.name}} hidden={haveSenders != null ? !haveSenders : false} />
            <div hidden={haveSenders != null ? haveSenders : true}>
                <b>Você ainda não possui nenhum sender registrado.</b><br/>
                Crie um novo sender para definir os locais para onde o evento deve ser disparado
            </div>
            <InputZone register={register('eventName',{required:true})} title="Nome" type="text"/>
            <InputZone register={register('eventDesc',{required:false})} title="Descrição" type="text"/>
            <InputZone register={register('date',{required:true})} title="Data" type="datetime-local"/>
        </BaseForm>
    )
}