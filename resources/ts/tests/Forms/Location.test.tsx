import { describe } from "vitest";
import { buildApiItem } from "../../Api/Conector";
import { TestWorkbanchFormEdit } from "./TestsBuilders";
import { FormLocation } from "../../Components/Creater/Forms/Location";

describe('editing',()=>{
    let obj = {
        name:"testLoc",
        type:1,
        data:{
            u:'http://localhost:9542/test-only',
            m:'GET',
            h:{
                'Auth':'TestAutHead'
            }
        }
    }
    let apiItem = buildApiItem({id:1,...obj},'');
    let workbanch = TestWorkbanchFormEdit(apiItem,FormLocation)
    .interceptRequest('/api/v1/locations/1',{},true);

    workbanch.startNew()
    .testObjectSendedToServer(obj,'(backend)don\'t change any property ');

    workbanch.startNew()
    .renderWithEdit(false).
    testObjectSendedToServer(obj,'(backend)(preRendered) don\'t change any property');

    workbanch.startNew().afterRender(async({user,container})=>{
        let inpName = container.querySelector('[name=name]')!;
        let inpUrl = container.querySelector('[name=u]')!;
        let selM = container.querySelector('[name=m]')!;
        await user.clear(inpName);
        await user.clear(inpUrl);
        await user.type(inpUrl,'https://localhost');
        await user.type(inpName,'newNTest');
        await user.selectOptions(selM,'POST');
    }).testObjectSendedToServer({
        name:'newNTest',
        type:1,
        data:{
            u:'https://localhost',
            m:'POST',
            h:{
                'Auth':'TestAutHead'
            }
        }
    },'(backend) change the defined props');
})