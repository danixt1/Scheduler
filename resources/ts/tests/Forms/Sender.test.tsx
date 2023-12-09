import { assert, describe, expect, it } from 'vitest';
import { FormBuilder, FormSender } from '../../Components/Creater/Forms';
import { TestWorkbanchFormEdit } from './TestsBuilders';
import { buildApiItem } from '../../Api/Conector';

describe("editing",()=>{
    let apiItem = buildApiItem({id:1,name:"test"},"/api/v1/senders");
    
    TestWorkbanchFormEdit(apiItem,FormSender)
    //Intercept the request to show the locations list
    .addResponse('GET/api/v1/locations',[],true)
    //Intercept the call to get the locations from the sender
    .addResponse('GET/api/v1/locations?sender_id=1',[],true)
    //Intercept the item refresh made after the request
    .addResponse('GET/api/v1/senders/1',{},true)
    //check if is trigged POST to senders
    .testRequest("Send the id from the edited element","/api/v1/senders/1");

    it("don't change unexpected properties")
    it("correct change the property")
})