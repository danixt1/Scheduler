import { API } from "../../Api";
import { ResourceList } from "./Parts";

export function SenderList(){
    return <ResourceList disableEditBtn={true} api={API.sender} propsToreturn={["name"]} renamer={{name:"Nome"}}/>
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
    return <ResourceList disableEditBtn={true} api={API.location} propsToreturn={["name"]} renamer={{name:"Nome"}} renderProp={newProps}/>
}