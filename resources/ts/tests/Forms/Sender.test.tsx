import { assert, describe, expect, it } from 'vitest';
import { FormSender } from '../../Components/Creater/Forms';
import { TestWorkbanchFormEdit } from './TestsBuilders';
import { buildApiItem, buildRefProperty } from '../../Api/Conector';
import { fireEvent, getByTestId, waitFor,screen, prettyDOM } from '@testing-library/react';
describe("editing",()=>{
    let apiItem = buildApiItem({id:1,name:"testSender"},"/api/v1/senders");
    
    let locations = [
        {id:1,name:"test",data:{u:"http://0.0.0.0"}},
        {id:2,name:"test2",data:{u:"http://0.0.0.0"}},
        {id:3,name:"notFromItem",data:{u:"http://0.0.0.0"}}
    ]
    let locSenders = [
        {id:1,sender:'http://0.0.0.0/1',location:'http://0.0.0.0/1'},
        {id:1,sender:'http://0.0.0.0/1',location:'http://0.0.0.0/2'}
    ]
    let workbanch = TestWorkbanchFormEdit(apiItem,FormSender)
    //Intercept the request to show the locations list
    .interceptRequest('GET/api/v1/locations',locations,true)
    //Intercept the item refresh made after the request
    .interceptRequest('GET/api/v1/senders/1',{},true)
    //Intercept the call to get the locations from the sender
    .interceptRequest('GET/api/v1/locsenders?sender_id=1',locSenders,true).
    afterRender(async ({container,getAllByText})=>{
        await Promise.all([
            waitFor(()=>expect(container.querySelector('.form-s-btn-local')).toBeEnabled()),
            waitFor(()=>expect(getAllByText('notFromItem')[0]).toBeInTheDocument())
        ])
    })

    workbanch.startNew()
    //check if triggers the POST to sender url
    .testRequest("Send the id from the edited element","/api/v1/senders/1");

    workbanch.startNew()
    .testObjectSendedToServer({name:"testSender",ids:[1,2]},"(backend) Don't change any properties");

    workbanch.startNew()
    .renderWithEdit(false)
    .testObjectSendedToServer({name:"testSender",ids:[1,2]},"(backend) Don't change any properties in pre created form");

    workbanch.startNew()
    .afterRender(async ({container,user})=>{
        waitFor(()=>expect(container.getElementsByClassName('form-s-btn-local')[0]).toBeEnabled());
        let nameInp =container.getElementsByClassName('form-s-inp-name')[0];
        await waitFor(()=>expect(getByTestId(container,'submit-btn')).toBeEnabled());
        await user.clear(nameInp);
        await user.type(nameInp,'moreData');
    })
    .testObjectSendedToServer({name:"moreData",ids:[1,2]},"(backend) changed the expected properties");
})