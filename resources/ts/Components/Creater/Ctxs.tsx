import { createContext } from "react";
import { FieldErrors } from "react-hook-form";

//TODO Remake this system to routing system, use react router. cited in https://github.com/danixt1/Scheduler/pull/4#issuecomment-1815583155
export const CtxFormSelector = createContext(['event',(val:string)=>{}] as [string,(val:string)=>void]);
/**
 * Ctx called By the [BaseForm](Forms/Base.tsx) after successful Edit/Create in the form.
 */
export const CtxAfterSuccessfulSubmit = createContext((ctx:'create' | 'edit',from:string)=>{return {reset:true}});

export const CloseWindownContext = createContext((a:boolean)=>{});
/** Pass the fields with error to by getted from inputs in form */
export const CtxErrorsInForm = createContext({} as FieldErrors<any>);