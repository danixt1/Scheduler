import { assert, describe, expect, it } from 'vitest';
import { FormBuilder, FormSender } from '../../Components/Creater/Forms';
import { TestWorkbanchFormEdit } from './TestsBuilders';
import { buildApiItem } from '../../Api/Conector';

describe("editing",()=>{
    let apiItem = buildApiItem({id:1,name:"test"},"/api/v1/senders");
    
    let locations = [
        {id:1,sender_id:1,name:"test",data:{u:"http://0.0.0.0"}},
        {id:2,sender_id:1,name:"test2",data:{u:"http://0.0.0.0"}},
        {id:3,sender_id:2,name:"notFromItem",data:{u:"http://0.0.0.0"}}
    ]
    let workbanch = TestWorkbanchFormEdit(apiItem,FormSender)
    //Intercept the request to show the locations list
    .interceptRequest('GET/api/v1/locations',locations,true)
    //Intercept the item refresh made after the request
    .interceptRequest('GET/api/v1/senders/1',{},true)
    //Intercept the call to get the locations from the sender
    .interceptRequest('GET/api/v1/locations?sender_id=1',locations.filter(e =>e.sender_id == 1),true);
    
    workbanch.startNew()
    //check if triggers the POST to sender url
    .testRequest("Send the id from the edited element","/api/v1/senders/1");

    workbanch.startNew()
    .testCheckSendedObject({name:"test",ids:[1,2,3]},"Don't change unexpected properties");
    it("correct change the property")
})