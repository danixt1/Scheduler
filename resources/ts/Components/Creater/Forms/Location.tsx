import { useEffect, useRef } from "react";
import { UseFormRegister, useFieldArray } from "react-hook-form";
import { API } from "../../../Api";
import { ApiItem } from "../../../Api/Api";
import { ItemLocation } from "../../../Api/Items";
import { InputZone, BaseInput } from "../Inputs";
import { CreatingLocationHttpRequest, FormBuilder, CreatingLocation,FormData } from "../Types";
import { BaseForm,formBuilder } from "./Base";

function LocationRequest({...data}:{apiItem:ApiItem<ItemLocation> | undefined,submit:((data:any)=>any)} & FormData<any>){
    const register = data.register as UseFormRegister<CreatingLocationHttpRequest>;
    const {setValue} = data;
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
            };
        })
    },[]);
    useEffect(()=>{
        let {apiItem} = data;
        if(!apiItem){
            return;
        }
        setValue('u',apiItem.data.u);
        setValue('m',apiItem.data.m);
        setValue('h',Object.keys(apiItem.data.h).map(e =>{return {name:e,value:apiItem?.data.h[e]}}));
    },[data.apiItem])
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
    const {register,control,setValue} = data;
    let inSubmit =useRef((data:any)=>{return data});
    useEffect(()=>{
        let {apiItem} = props;
        if(!apiItem){
            return;
        };
        setValue('name',apiItem.name);
    },[props.apiItem])
    function putToSubmit(fn:(data:any)=>void){
        inSubmit.current = fn;
    }
    function processing(data:any){
        return Object.assign({type:1,name:data.name,id:data.id},inSubmit.current(data));
    }
    return (
        <BaseForm {...props} data={data}>
            <InputZone title="Nome" type="text" register={register('name',{required:true})} />
            <LocationRequest {...data} submit={putToSubmit} apiItem={props.apiItem}/>
        </BaseForm>
    )
}