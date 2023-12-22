import { useContext, useState } from "react";
import { API } from "../../Api";
import { ApiItem } from "../../Api/Api";
import { CtxFormSelector, CtxAfterSuccessfulSubmit } from "../Creater/Ctxs";
import { FormLocation } from "../Creater/Forms/Location";
import { FormSender } from "../Creater/Forms/Sender";
import { FormWithListAttrs } from "../Creater/Types";
import { EditListContext, ResourceList } from "./Parts";

export function SenderList(){
    return <ResourceList disableEditBtn={false} api={API.sender} propsToreturn={["name"]} renamer={{name:"Nome"}}/>
}
export function LocationList(){
    let newProps = {
        ["Método"](e:any){
            return e.data.m;
        },
        Url(e:any){
            return e.data.u
        }
    }
    return <ResourceList disableEditBtn={false} api={API.location} propsToreturn={["name"]} renamer={{name:"Nome"}} renderProp={newProps}/>
}
export function FormWithList({name,list,form}:FormWithListAttrs){
    let [noHidden,setNext] = useContext(CtxFormSelector);
    let [editItem,setItemToEdit]= useState( {} as  {apiItem?:ApiItem<Record<string,any>>});
    return (
        <div hidden={noHidden != name}>
            <CtxAfterSuccessfulSubmit.Provider value={(mode)=>{if(mode === 'edit'){setItemToEdit({})} return {reset:true}}}>
                <EditListContext.Provider value={(item)=>{setItemToEdit({apiItem:item});}}>
                    {form(editItem)}
                    {list()}
                </EditListContext.Provider>
            </CtxAfterSuccessfulSubmit.Provider>

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