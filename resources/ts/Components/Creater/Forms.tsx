import { createContext, createRef, useContext, useEffect, useRef, useState } from "react";
import { Control, UseFormRegister, useFieldArray, useForm } from "react-hook-form";
import { API } from "../../Api";
import { CalendarEventContext } from "../../contexts";
import { SelectWithApiData, InputZone, BaseInput } from "./Inputs";

interface Sender{
    name:string,
    id:number
}
interface CreatingSender extends Sender{
    name:string
    locations:{value:string}[]
}
interface CreatingLocation extends LocationHttpRequest{
    name:string
}
interface LocationHttpRequest{
    /** Url */
    u:string
    m:string
    h:{[index:string]:string}
}
type CreatingLocationHttpRequest = Omit<LocationHttpRequest,'h'> & {h:Array<{name:string,value:string}>};
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

export let FormSelector = createContext(['event',(val:string)=>{}] as [string,(val:string)=>void]);

export function FormEvent({close,...props}:FormBuilder){
    let {setEvents} = useContext(CalendarEventContext);
    let [noHidden,setNext] = useContext(FormSelector);

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
        <form onSubmit={handleSubmit(onSubmit)} {...props} hidden={noHidden != 'event'}>
            <h1>Novo Evento</h1>
            <SelectWithApiData title="Enviar para" 
                register={register('sender_id',{required:true,valueAsNumber:true})} reqTo={API.sender}
                show={(e:Sender)=>{return e.name}}/>
            <InputZone register={register('eventName',{required:true})} title="Nome" type="text"/>
            <InputZone register={register('eventDesc',{required:false})} title="Descrição" type="text"/>
            <InputZone register={register('date',{required:true})} title="Data" type="datetime-local"/>
            <input type="submit" value="Salvar Evento"/>
        </form>
    )
}

function LocationRequest(data:{register:UseFormRegister<any>,control:Control<any,any>,submit:(data:any)=>any,form:React.RefObject<HTMLFormElement>}){
    const register = data.register as UseFormRegister<CreatingLocationHttpRequest>;
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control:data.control,
        name: "h", 
    });
    useEffect(()=>{
        let formElem = data.form.current!;
        formElem.addEventListener('reset',()=>{
            remove();
        })
        data.submit((data:CreatingLocationHttpRequest)=>{ 
            let heads:{[index:string]:string} = {};
            for(const {name,value} of data.h){
                if(name)
                    heads[name] = value;
            }
            return {
                data:{h:heads,u:data.u,m:data.m}
            }
        })
    },[]);
    return (
        <>
            <InputZone title="Url" type="text" register={register('u',{required:true,pattern:/^https?:\/\//})}/>
            <BaseInput title="Método">
                <select {...register('m',{required:true})} defaultValue={'GET'}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="DELETE">DELETE</option>
                    <option value="UPDATE">UPDATE</option>
                </select>
            </BaseInput>
            <BaseInput title="Head">
                <div className="cr-list">
                    {fields.map((e,index)=>{
                        return (
                            <div key={e.id} className="cr-list-item">
                                <input {...register(`h.${index}.name`)}  placeholder="Nome"/>
                                <input {...register(`h.${index}.value`)} placeholder="Valor"/>
                            </div>
                        )
                    })}
                </div>
                <input type="button" value="Adicionar" onClick={()=>append({name:'',value:''})}/>
            </BaseInput>
        </>
    )
}
export function FormLocation({close,...props}:FormBuilder){
    const {register,handleSubmit,control,reset} = useForm<CreatingLocation>();
    let [noHidden,setNext] = useContext(FormSelector);
    let inSubmit =useRef((data:any)=>{return data});
    let formRef = createRef<HTMLFormElement>();
    let submitRef = createRef<HTMLInputElement>();

    function putToSubmit(fn:(data:any)=>void){
        inSubmit.current = fn;
    }
    function onSubmit(data:any){
        submitRef.current!.disabled = true;
        data.type = 1;
        Object.assign(data,inSubmit.current(data));
        API.location(data).
            then(e =>{formRef.current!.reset();}).
            catch(e =>{alert('failed saving'); throw e}).
            finally(()=>{submitRef.current!.disabled = false;})
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} {...props} hidden={noHidden != 'location'} ref={formRef}>
            <h1>Novo Local</h1>
            <InputZone title="Nome" type="text" register={register('name',{required:true})} />
            <LocationRequest register={register} control={control} submit={putToSubmit} form={formRef}/>
            <input type="submit" value="Salvar Local" ref={submitRef}/>
        </form>
    )
}
export function FormSender({close,...props}:FormBuilder){
    const {register,handleSubmit,control} = useForm<CreatingSender>();
    let [noHidden,setNext] = useContext(FormSelector);
    let [locs,setLocs] = useState([] as {name:string,id:number}[]);
    let [inLoadState,setLoad] = useState(true);
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control,
        name: "locations", 
    });
    useEffect(()=>{
        API.location().then(e =>{
            setLocs(e.list.map(e =>{
                return {name:e.name,id:e.id};
            }))
            setLoad(false);
        })
    },[])
    function onSubmit(data:CreatingSender){
        inLoadState = true;
        let ids = data.locations.filter(e =>e.value != '').map(e => Number.parseInt(e.value));
        API.sender({name:data.name,ids}).then(e =>{
            inLoadState = false;
        })
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} {...props} hidden={noHidden != 'sender'}>
            <h1>Novo sender</h1>
            <InputZone title="Nome" register={register('name',{required:true})} type={'text'} />
            {fields.map((e,index) =>{
                return (
                    <select key={e.id} {...register(`locations.${index}.value`)}>
                        {locs.map(t => <option value={t.id} key={e.id + ' '+t.id} >{t.name}</option>)}
                    </select>
                )
            })}
            <input type="button" value={'Adicionar local'} disabled={inLoadState} onClick={()=>{if(fields.length < 4){append({value:''})}}} />
            <input type="submit" value="Criar sender" />
        </form>
    )
}