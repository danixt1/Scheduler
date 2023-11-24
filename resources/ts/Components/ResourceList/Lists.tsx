import { API } from "../../Api";
import { ResourceList } from "./Parts";

export function SenderList(){
    return <ResourceList api={API.sender} propsToreturn={["name"]} renamer={{name:"Nome"}}/>
}
export function LocationList(){
    //TODO Location need to handle new properties to be added
    return <ResourceList api={API.location} propsToreturn={["name"]} renamer={{name:"Nome"}}/>
}