import { ReactNode} from "react";
import Popup from "reactjs-popup";
interface BasePopUp{
    onBackClickClose:()=>void
    children:ReactNode
    hidden?:boolean
}
type FormPopUp = BasePopUp; 
export function BasePopUp({onBackClickClose,hidden,children}:BasePopUp){
    return (
        <Popup open={!hidden} onClose={onBackClickClose}>
            {children}
        </Popup>
    )
}
export function FormPopUp({children,...data}:FormPopUp){
    return (
        <BasePopUp {...data}>
            {children}
        </BasePopUp>
    )
}