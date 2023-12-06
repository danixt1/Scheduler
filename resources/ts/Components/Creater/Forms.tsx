import { ReactElement, ReactNode, createContext, createRef, useContext, useEffect, useRef, useState } from "react";
import { Control, UseFormRegister, UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { API } from "../../Api";
import { CalendarEventContext } from "../../contexts";
import { SelectWithApiData, InputZone, BaseInput } from "./Inputs";
import { ApiItem, FuncApi } from "../../Api/Api";
import { ItemEvCalendar, ItemLocation, ItemSender } from "../../Api/Items";
import { LocationList, SenderList } from "../ResourceList";
import { EditListContext } from "../ResourceList/Parts";
//TODO fix edit system
interface FormData<FORM_INFO extends Record<string, any>> extends UseFormReturn<FORM_INFO,any,any>{
    api:FuncApi<any,any>
    name:string
    displayName:string
    processing:(data:any)=>any
}
interface Sender{
    name:string
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

interface TimedEvent{
    sender_id:number
    date:string
}
interface CreatingEvent extends TimedEvent{
    id?:string
    eventName:string
    eventDesc:string
}
export type FormBuilder<IT> = React.HTMLAttributes<HTMLFormElement> & {apiItem?:ApiItem<IT>};
export interface BaseFormAttrs extends React.HTMLAttributes<HTMLElement>{
    data:FormData<any>
    apiItem?:ApiItem<Record<any,any>>
    children:ReactNode,
    disableSubmit?:boolean
};
export interface FormWithListAttrs{
    name:string
    apiItem?:ApiItem<Record<any,any>>
    list():ReactNode
    form(item:{apiItem?:ApiItem<Record<any,any>>}):ReactNode
}
//TODO delete this and use the PageSwitcher
export let FormSelector = createContext(['event',(val:string)=>{}] as [string,(val:string)=>void]);
export const CloseWindownContext = createContext((a:boolean)=>{});

export function BaseForm({apiItem,children,data,disableSubmit,...props}:BaseFormAttrs){
    let {register,name,displayName,processing,handleSubmit,api,reset} = data;
    let [noHidden,setNext] = useContext(FormSelector);
    let submitRef = createRef<HTMLInputElement>();
        let item_id = apiItem ? apiItem.id : undefined;
        props.onSubmit = handleSubmit((data)=>{
        let btn =submitRef.current!;
        let result = processing(data);
        btn.disabled = true;
        api(result).
            finally(()=>{btn.disabled = false}).
            then(()=>{reset((e:any)=>{
                let res:Record<string,any> = {};
                for(const [varName,value] of Object.entries(e)){
                    res[varName] = Array.isArray(value) ? [] : '';
                }
                return res;
                });
            });
    })
        return (
        <form {...props} hidden={noHidden != name}>
            <h1>{item_id ? 'Editar' : 'Novo'} {' ' +displayName}</h1>
            {item_id && <input type="hidden" {...register('id',{value:item_id})}/>}
            {children}
            <div>
                <input type="submit" value={"Salvar " + displayName} ref={submitRef} className="inp-creater" disabled={disableSubmit} />
            </div>
        </form>
    )
}
export function FormWithList({name,apiItem,list,form}:FormWithListAttrs){
    let [noHidden,setNext] = useContext(FormSelector);
    let [editItem,setItemToEdit]= useState( {apiItem} as  {apiItem?:ApiItem<Record<string,any>>});
    return (
        <div hidden={noHidden != name}>
            <EditListContext.Provider value={(item)=>{setItemToEdit({apiItem:item});}}>
                {form(editItem)}
                {list()}
            </EditListContext.Provider>

        </div>
    )
}
export function FormListSender(){
    return (
        <FormWithList name="sender" form={FormSender} list={SenderList} />
    )
}
export function FormListLocation(){
    return (
        <FormWithList name="location" form={FormLocation} list={LocationList}/>
    )
}
export function FormEvent({...props}:FormBuilder<ItemEvCalendar>){
    let {setEvents} = useContext(CalendarEventContext);
    let close = useContext(CloseWindownContext);
    let defValues:any = undefined;
    if(props.apiItem){
        let item = props.apiItem;
        let date = item.date;
        let dateStr = (new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);
        console.log(dateStr);
        
        defValues = {
            date:dateStr,
            eventName:item.data.name,
            eventDesc:item.data.description,
            sender_id:item.sender.id
        }
    }
    let data = formBuilder<CreatingEvent>('event','Evento',processing,API.events.calendar,defValues);
    let [haveSenders,setHaveSender] = useState(null as null | boolean);
    const {register} = data;

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
            //Calling the message in edit mode cause render bugs
            if(!props.apiItem){
                setHaveSender(e.list.length != 0);
            }
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
    })
    return (
        <BaseForm  {...props} data={data} disableSubmit = {haveSenders != null ? !haveSenders : false}>
            <SelectWithApiData title="Enviar para" 
                register={register('sender_id',{required:true,valueAsNumber:true})} 
                reqTo={API.sender}
                inRequest={inPrms}
                selected={props.apiItem ? props.apiItem.sender.id : undefined}
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

function LocationRequest(data:{register:UseFormRegister<any>,control:Control<any,any>,submit:(data:any)=>any}){
    const register = data.register as UseFormRegister<CreatingLocationHttpRequest>;
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control:data.control,
        name: "h", 
    });
    useEffect(()=>{
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
export function FormLocation({...props}:FormBuilder<ItemLocation>){
    let data = formBuilder<CreatingLocation>('location','local',processing,API.location);
    const {register,control} = data;
    let inSubmit =useRef((data:any)=>{return data});

    function putToSubmit(fn:(data:any)=>void){
        inSubmit.current = fn;
    }
    function processing(data:any){
        data.type = 1;
        Object.assign(data,inSubmit.current(data));
        return data;
    }
    return (
        <BaseForm {...props} data={data}>
            <InputZone title="Nome" type="text" register={register('name',{required:true})} />
            <LocationRequest register={register} control={control} submit={putToSubmit}/>
        </BaseForm>
    )
}
export function FormSender({...props}:FormBuilder<ItemSender>){
    let data = formBuilder<CreatingSender>('sender','Sender',process,API.sender);
    //TODO Attention need to isolate the formBuilder method to refresh form data
    const {register,handleSubmit,control,setValue} = data;
    let [noHidden,setNext] = useContext(FormSelector);
    let [locs,setLocs] = useState([] as {name:string,id:number}[]);
    let [inLoadState,setLoad] = useState(true);
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control,
        name: "locations", 
    });
    function process(data:CreatingSender){
        let ids = data.locations.filter(e =>e.value != '').map(e => Number.parseInt(e.value));
        return {name:data.name,ids,id:data.id}
    }
    useEffect(()=>{
        if(props.apiItem){
            setValue('name',props.apiItem.name);
            
            //make system to get value with refered foreign key
            API.location.withForeign('sender',props.apiItem.id).then(e =>{
                for(const item of e.list){
                    append({value:item.id + ''})
                }
            })
        }
    },[props.apiItem])
    useEffect(()=>{
        API.location().then(e =>{
            setLocs(e.list.map(e =>{
                return {name:e.name,id:e.id};
            }))
            setLoad(false);
        })
        API.location.on('create',onCreated);
        return ()=>{
            API.location.off('create',onCreated);
        }
        function onCreated(item:ApiItem<ItemLocation> | null){
            if(item){
                let obj:{name: string,id: number} = {
                    id:item.id,
                    name:item.name
                };
                setLocs(e =>[...e,obj]);
            }
        }
    },[])
    return (
        <BaseForm data={data} {...props}>
            <InputZone title="Nome" register={register('name',{required:true})} type={'text'} />
            {fields.map((e,index) =>{
                return (
                    <select key={e.id} {...register(`locations.${index}.value`)}>
                        {locs.map(t => <option value={t.id} key={e.id + ' '+t.id} >{t.name}</option>)}
                    </select>
                )
            })}
            <input type="button" value={'Adicionar local'} disabled={inLoadState} onClick={()=>{if(fields.length < 4){append({value:''})}}} />
        </BaseForm>
    )
}
export function formBuilder<FORM_INFO extends Record<string, any>>(name:string,displayName:string,processData:(data:any)=>any,api:FuncApi<any,any>,def:any = undefined):FormData<FORM_INFO>{
    let form = useForm<FORM_INFO>({defaultValues:def});
    return {...form,processing:processData,api,name,displayName};
}
