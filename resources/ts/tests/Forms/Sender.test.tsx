import { assert, describe, expect, it } from 'vitest';
import { FormBuilder, FormSender } from '../../Components/Creater/Forms';
import { MakeFormEditTest } from './TestsBuilders';
import { buildApiItem } from '../../Api/Conector';

describe("editing",()=>{
    //TODO make changes in API system, and make dev serve to change the original server from the apis
    let apiItem = buildApiItem({id:1,name:"test"},"/v1/senders");
    let tester = MakeFormEditTest(apiItem,FormSender);
    tester.addResponse('v1/locations?sender_id=1',[],true);
    tester.makeRequestTest("Send the id from the edited element","/v1/senders/1");
    it("don't change unexpected properties")
    it("correct change the property")
})
/**
 * Processo:
 * Antes de qualquer processo preparar o retorno de dados ao chamar qual é o objeto a ser editado
 * Checar se passou o id pro backend.
 * O construtor deve executar um it.
 * - chamar uma função para iniciar a operação de edição no front end
 * 
 * Processo básico
 * - Primeiro é passado o objeto api
 * - pode ser chamado mais dados
 */
interface onNewData{
    required:boolean
    path:string
    returnValue:any | any[]
}