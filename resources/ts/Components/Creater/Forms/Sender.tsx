import { useContext, useState, useRef, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { API } from "../../../Api";
import { ApiItem } from "../../../Api/Api";
import { ItemSender, ItemLocation } from "../../../Api/Items";
import { SvgTrash } from "../../../Svgs";
import { CtxFormSelector } from "../Ctxs";
import { InputZone } from "../Inputs";
import { FormBuilder, CreatingSender } from "../Types";
import { BaseForm,formBuilder } from "./Base";

export function FormSender({...props}:FormBuilder<ItemSender>){

    let data = formBuilder<CreatingSender>('sender','Sender',process,API.sender);

    const {register,control,setValue} = data;
    let [noHidden,setNext] = useContext(CtxFormSelector);
    let [locs,setLocs] = useState([] as {name:string,id:number}[]);
    let [inLoadState,setLoad] = useState(true);
    let [disableSubmit,setSubmitState] = useState(true);
    let leftToBeEnable = useRef(props.apiItem ? 2 : 1);
    
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control,
        name: "locations", 
    });
    function process(data:CreatingSender){
        let ids = data.locations.filter(e =>e.value != '').map(e => Number.parseInt(e.value));
        return {name:data.name,ids,id:data.id}
    }
    useEffect(()=>{
        if(inLoadState || !props.apiItem){
            return;
        }
        setValue('name',props.apiItem!.name);
        if(!disableSubmit){
            setSubmitState(true);
        }
        //make system to get value with refered foreign key
        API.locSender.withForeign('sender',props.apiItem.id).then(e =>{

            setValue('locations',e.list.map(item =>{return {value:item.location.id + ''}}))
            leftToBeEnable.current --;
            if(leftToBeEnable.current <= 0){
                setSubmitState(false);
            }
        })
    },[inLoadState,props.apiItem]);
    useEffect(()=>{
        API.location().then(e =>{
            setLocs(e.list.map(e =>{
                return {name:e.name,id:e.id};
            }))
            leftToBeEnable.current --;
            if(leftToBeEnable.current <= 0){
                setSubmitState(false);
            }
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
        <BaseForm {...props} data={data} disableSubmit={disableSubmit}>
            <InputZone title="Nome" register={register('name',{required:true})} type='text' className="form-s-inp-name" />
            <div className="cr-item-list">
                {fields.map((e,index) =>{
                    return (
                        <span key={e.id}>
                            <select {...register(`locations.${index}.value`)}>
                                {locs.map(t => <option value={t.id} key={e.id + ' '+t.id} >{t.name}</option>)}
                            </select>
                            <span onClick={()=>remove(index)}><SvgTrash/></span>
                        </span>
                    )
                })}
            </div>
            <input 
                className="form-s-btn-local"
                type="button" 
                value={'Adicionar local'} 
                disabled={inLoadState} 
                onClick={()=>{if(fields.length < 4){append({value:''})}}} />
        </BaseForm>
    )
}