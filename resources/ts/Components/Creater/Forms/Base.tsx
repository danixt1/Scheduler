import { useContext, useRef, useState } from "react";
import { CtxFormSelector, CtxAfterSuccessfulSubmit } from "../Ctxs";
import { BaseFormAttrs,FormData } from "../Types";
import { useForm } from "react-hook-form";
import { FuncApi } from "../../../Api/Api";
/**
 * Base Form for all elements in creater Component.
 */
export function BaseForm({apiItem,children,data,disableSubmit = false,...props}:BaseFormAttrs){

    let {name,displayName,processing,handleSubmit,api,reset} = data;
    let [noHidden,setNext] = useContext(CtxFormSelector);
    let afterSubmit = useContext(CtxAfterSuccessfulSubmit);
    
    let item_id = useRef(undefined as number | undefined);
    item_id.current = apiItem ? apiItem.id : undefined
    let [isInSubmitPhase,setSubmitPhase] = useState(false);
    let [btnSubmitDisable,setBtnSubmitDisable] = useState(false);
    function onValid(data:any){
        if(typeof item_id.current === 'number'){
            data.id = item_id.current;
        }
        setSubmitPhase(true);
        setBtnSubmitDisable(true);
        let result = processing(data);
        if(result instanceof Promise){
            result.then(next);
        }else{
            next(result);
        }
        function next(result:any){
            api(result)
            .finally(()=>{setBtnSubmitDisable(false);})
            .then(()=>{
                let {reset:doReset} = afterSubmit(apiItem ? 'edit' : 'create',name);
                if(!doReset){
                    return;
                }
                reset((e:any)=>{
                    let res:Record<string,any> = {};
                    for(const [varName,value] of Object.entries(e)){
                        res[varName] = Array.isArray(value) ? [] : '';
                    }
                    return res;
                });
            });
        }
    }

    return (
        <form {...props} hidden={noHidden != name} onSubmit={handleSubmit(onValid,(e)=>console.log(e))} >
            <h1>{typeof item_id.current === 'number' ? 'Editar' : 'Novo'} {' ' +displayName}</h1>
            {children}
            <div>
                <input 
                type="submit" 
                data-testid="submit-btn" 
                value={"Salvar " + displayName} 
                disabled={btnSubmitDisable || disableSubmit}
                className="inp-creater" />
            </div>
        </form>
    )
}
export function formBuilder<FORM_INFO extends Record<string, any>>(name:string,displayName:string,processData:(data:any)=>any,api:FuncApi<any,any>,def:any = undefined):FormData<FORM_INFO>{
    let form = useForm<FORM_INFO>({defaultValues:def});
    return {...form,processing:processData,api,name,displayName};
}