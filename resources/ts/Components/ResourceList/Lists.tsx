import { API } from "../../Api";
import { ResourceList } from "./Parts";

export function SenderList(){
    return <ResourceList api={API.sender} propsToreturn={["name"]} renamer={{name:"Nome"}}/>
}