import { describe, expect } from "vitest";
import { buildApiItem, buildRefProperty } from "../../Api/Conector";
import { TestWorkbanchFormEdit } from "./TestsBuilders";
import { FormEvent } from "../../Components/Creater/Forms";
import { prettyDOM, waitFor } from "@testing-library/react";

describe('editing',()=>{
    let item = {
        id:1,
        type:1,
        data:{
            name:'testingName',
            description:"testDesc"
        },
        date:new Date(),
        sender:buildRefProperty('http://localhost:9543/senders/1')
    };
    let apiItem = buildApiItem(item,"/api/v1/events/calendar",{
        sender:(val:number)=>{return {value:val,dbName:'sender_id'}},
        date:(val:Date)=>{return {value:val.toUTCString()}}
    });
    let senders = [
        {id:1,name:"senderOfTest"},
        {id:2,name:"otherSender"},
        {id:3,name:"testSender"}
    ]
    let workbanch = TestWorkbanchFormEdit(apiItem,FormEvent)
    .interceptRequest('/api/v1/senders',senders,true)
    .afterRender(async ({container})=>{
        await waitFor(()=>expect(container.querySelector('.cr-loading')).not.toBeVisible());
    })

    workbanch.startNew()
    .testObjectSendedToServer(item,"(backend) don't change the object");
})