import { describe, expect } from "vitest";
import { buildApiItem, buildRefProperty } from "../../Api/Conector";
import { TestWorkbanchFormEdit } from "./TestsBuilders";
import { FormEvent } from "../../Components/Creater/Forms/Event";
import { prettyDOM, waitFor } from "@testing-library/react";

describe('editing',()=>{
    let item = {
        id:1,
        type:1,
        data:{
            name:'testingName',
            description:"testDesc"
        },
        date:new Date("2023-12-20T15:20:55.572Z"),
        sender:buildRefProperty('http://localhost:9543/senders/1'),
        event:buildRefProperty('http://localhost:9543/events/data/1'),
        timer:buildRefProperty('http://localhost:9543/events/data/1')
    };
    let apiItem = buildApiItem(item,"/api/v1/events/calendar");
    let senders = [
        {id:1,name:"senderOfTest"},
        {id:2,name:"otherSender"},
        {id:3,name:"testSender"},
        {id:4,name:"teste4Sender"}
    ]
    let workbanch = TestWorkbanchFormEdit(apiItem,FormEvent)
    .interceptRequest('/api/v1/senders',senders,true)
    .interceptRequest('GET/api/v1/events/calendar/1',{},true)
    .afterRender(async ({container})=>{
        await waitFor(()=>expect(container.querySelector('.cr-loading')).toHaveAttribute('hidden'));
    });

    workbanch.startNew().
    testRequest('Check if calls the correct path','/api/v1/events/calendar/1')

    workbanch.startNew()
    .testObjectSendedToServer({
        sender_id:1,
        date:'2023-12-20T15:20:00.000Z',
        type:1,
        data:{
            name:"testingName",
            description:"testDesc"
        }
    },"(backend) don't change the object");

    workbanch.startNew()
    .afterRender(async ({container,user})=>{
        await waitFor(()=>expect(container.querySelector('.cr-loading')).toHaveAttribute('hidden'));
        let evName = container.querySelector('[name=eventName]')!;
        let evDesc = container.querySelector('[name=eventDesc]')!;
        let evSel = container.querySelector('[name=sender_id]')!;
        await user.clear(evDesc);
        await user.clear(evName);
        await user.type(evName,'newTName');
        await user.type(evDesc,'descT');
        await user.selectOptions(evSel,'testSender');

    }).testObjectSendedToServer({
        sender_id:3,
        date:'2023-12-20T15:20:00.000Z',
        type:1,
        data:{
            name:"newTName",
            description:"descT"
        }
    },'(backend) change the defined properties')
})