import { assert, describe, expect, it } from 'vitest';
import { FormBuilder, FormSender } from '../../Components/Creater/Forms';
import { TestWorkbanchFormEdit } from './TestsBuilders';
import { buildApiItem } from '../../Api/Conector';

describe("editing",()=>{
    let apiItem = buildApiItem({id:1,name:"test"},"/v1/senders");
    let tester = TestWorkbanchFormEdit(apiItem,FormSender);
    tester.addResponse('/api/v1/locations?sender_id=1',[],true);
    tester.testRequest("Send the id from the edited element","/api/v1/senders/1");
    it("don't change unexpected properties")
    it("correct change the property")
})