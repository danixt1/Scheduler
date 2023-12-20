import { afterAll, afterEach, assert, beforeAll, describe, expect, it } from 'vitest';
import { ApiItem } from '../../Api/Api';
import { RenderResult, fireEvent, render,screen, waitFor } from '@testing-library/react';
import { FormBuilder } from '../../Components/Creater/Forms';
import { createServer,IncomingMessage,ServerResponse } from 'http';
import axios from 'axios';
import userEvent, { UserEvent } from '@testing-library/user-event'
import { useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';


//Remake the server to continue opened after the test end
type FormElem = (props:FormBuilder<any>)=>JSX.Element;
type ReqInfo = {path:string,value:any | any[],required:boolean};
const DEF_PORT = 9543;
interface EditStructure{
    apiItem:ApiItem<Record<any,any>>
    additionalRequests:ReqInfo[]
    Form:FormElem
    afterFormRender:(data:RenderResult & {user:UserEvent})=>(Promise<void> | void)
    afterIntercepts:()=>Promise<void> | void,
    renderWithEdit:boolean
}
const METHODS = ["GET","POST","DELETE","UPDATE"];
export function TestWorkbanchFormEdit(itemApi:ApiItem<Record<any,any>>,form:FormElem){
    let onRequest:Exclude<Parameters<typeof createServer>[1],undefined> = (req,res)=>{res.writeHead(200, { 'Content-Type': 'application/json' }).end(renderResponseTo(req))}
    let server = createServer((req,res)=>{
        onRequest(req,res);
    })
    let original = axios.defaults.baseURL;
    let defReq = (req:any,res:any)=>{
        console.log("Request called not inside in test:",req.method,req.url);
        jsonRes(res,renderResponseTo(req));
    };
    beforeAll(()=>{
        axios.defaults.baseURL = "http://localhost:"+ DEF_PORT;
        return new Promise((res)=>{
            server.listen(DEF_PORT,res);
        })
    })
    afterEach(()=>{
        onRequest = defReq;
    })
    afterAll(()=>{
        return new Promise<any>((res)=>{
            axios.defaults.baseURL = original;
            server.close(res);
        })
    })
    let structure:EditStructure = {
        apiItem:itemApi,
        additionalRequests:[],
        Form:form,
        afterFormRender:async ()=>{},
        afterIntercepts:()=>{},
        renderWithEdit:true
    }
    function test(name:string,fn:(res:()=>void)=>void){
        it(name,()=>{
            return new Promise<void>((res=>{
                
                fn(res);
            }))
        })
    }
    function makeThis(actStr:EditStructure,base?:EditStructure){
        return {
            testObjectSendedToServer(expectedObj:any,testName:string){
                let {Form: form, apiItem,additionalRequests:requests,afterFormRender,afterIntercepts,renderWithEdit} = actStr;
                //Get Base actual request and the new requests
                if(base){
                    let upper = JSON.parse(JSON.stringify(base.additionalRequests));
                    requests = [...upper,...requests];
                    
                }
                test(testName,(testEnd)=>{
                    let finish = TestFinishEvent(afterIntercepts,testEnd);
                    let interceptor = RequestInteceptor(requests,finish.finishedIntercepts);
                    onRequest =(req,res)=>{
                        if(interceptor(req,res)){
                            return;
                        }
                        let data:string = "";
                        req.on('data',(e)=>{
                            data +=e;
                        })
                        req.on('end',()=>{
                            if(req.method == "GET"){
                                console.log("Not intercepted request",req.method,req.url);
                                return;
                            }
                            let jsonData = JSON.parse(data);
                            assert.deepEqual(jsonData,expectedObj,"Have diference with the expected final result");
                            finish.mainTestEnd();
                        })
                        res.writeHead(200).end();
                    }
                    this.renderAndClick(form,apiItem,afterFormRender,renderWithEdit);
                });
            },
            testAfterRender(testName:string,afterRender:()=>Promise<void> | void){
                let {Form, apiItem} = actStr;
                test(testName,(finished)=>{
                    this.render(Form,apiItem,afterRender).finally(finished);
                })
            },
            testRequest(testName:string,expectedPath:string){
                let {Form: form, apiItem,afterFormRender,additionalRequests:requests,afterIntercepts,renderWithEdit} = actStr;
                if(base){
                    let upper = JSON.parse(JSON.stringify(base.additionalRequests));
                    requests = [...upper,...requests];
                }
                test(testName,(testEnd)=>{
                    let finish = TestFinishEvent(afterIntercepts,testEnd);
                    let havePassedInAssert = false;
                    let interceptor = RequestInteceptor(requests,finish.finishedIntercepts);
                    onRequest = (req,res)=>{
                        
                        if(interceptor(req,res)){
                            return;
                        }
                        jsonRes(res,renderResponseTo(req));
                        if(!havePassedInAssert){
                            havePassedInAssert = true;
                            assert.equal(req.url,expectedPath);
                            finish.mainTestEnd();
                        }else{
                            console.warn("A not expected request has been passed after the end of the request.\n request to path:"+req.url);
                        }
                    };
                    this.renderAndClick(form,apiItem,afterFormRender,renderWithEdit);
                });
                return this;
            },
            async renderAndClick(Elem:FormElem = actStr.Form,apiItem:ApiItem<Record<any, any>> =actStr.apiItem,afterRender = actStr.afterFormRender,renderWithEdit = actStr.renderWithEdit ){
                let data =await this.render(Elem,apiItem,afterRender,renderWithEdit);

                let elem =screen.getByTestId("submit-btn");
                expect(elem,"Submit button not found").toBeInstanceOf(HTMLInputElement);
                await waitFor(()=>expect(elem).toBeEnabled());
                fireEvent.click(elem);
                return data;
            },
            async render(Elem:FormElem = actStr.Form,apiItem:ApiItem<Record<any, any>> =actStr.apiItem,afterRender = actStr.afterFormRender,renderWithEdit = actStr.renderWithEdit){
                const user = userEvent.setup();
                let awaiter:any = undefined;
                function Item(){
                    let [apiItemState,setItem] = useState(renderWithEdit ? apiItem : undefined);
                    if(!renderWithEdit){
                        setTimeout(()=>{
                            awaiter();
                            setItem(apiItem);
                        });
                    }
                    return <Elem apiItem={apiItemState}/>
                }
                const resRender= render(<Item />);
                if(!renderWithEdit){
                    await new Promise<void>(res =>{
                        awaiter = ()=>{
                            res();
                        }
                    })
                }
                const finalObj = {user,...resRender};
                let res = afterRender(finalObj);
                if(res instanceof Promise){
                    await res;
                };
                return finalObj;
            },
            renderWithEdit(val:boolean){
                actStr.renderWithEdit = val;
                return this;
            },
            startNew(){
                let newObj = Object.create(actStr);
                newObj.additionalRequests = [];
                return makeThis(newObj,actStr);
            },
            item(itemApi:ApiItem<Record<any,any>>){
                actStr.apiItem = itemApi;
                return this;
            },
            afterRequests(fn:()=>Promise<void> | void){
                actStr.afterIntercepts = fn;
                return this;
            },
            afterRender(fn:(data:RenderResult & {user:UserEvent}) => Promise<void> | void){
                actStr.afterFormRender = fn;
                return this;
            },
            /**
             * Add a expected path to by called in the test process
             * @param path 
             * @param resp 
             * @param required case true tests fail after 600ms with no call
             * @returns 
             */
            interceptRequest(path:string,resp:any | any[],required:boolean =false){
                actStr.additionalRequests.push({path,value:resp,required});
                return this;
            }
        }
    }
    return makeThis(structure)
}
function RequestInteceptor(requests:ReqInfo[],onFinished:()=>void){
    let toValidate = requests.map<number>((e)=>e.required ? 1 : 0).reduce((prev,curr)=>prev+curr,0);
    let newReqs:(ReqInfo & {m:string})[] = requests.map(e =>{
        let method = "GET";
        let path = e.path;
        for(const act of METHODS){
            if(e.path.startsWith(act)){
                method = act;
                path = e.path.substring(act.length);
            }
        }
        return {
            required:e.required,
            value:e.value,
            path,
            m:method
        }
    });
    let validated = 0;
    let finishCalled = false;
    return function(req:IncomingMessage,res:ServerResponse){
        
        for(const resToRequest of newReqs){
            let method = resToRequest.m;
            if(resToRequest.path === req.url && method == req.method){
                if(resToRequest.required){
                    validated++;
                }
                let value = resToRequest.value;
                let send =Array.isArray(value) ? renderListResponse(value) : value;
                jsonRes(res,JSON.stringify(send));
                if(toValidate == validated){
                    if(!finishCalled){
                        onFinished();
                        finishCalled = true;
                    }
                }
                return true;
            }
        }
        return false;
    }
}
function renderResponseTo(req:IncomingMessage){
    let final =req.url ? req.url[req.url.length - 1] : '';
    let n = Number.parseInt(final);
    let result:any = "";
    if(req.method === "GET"){
        return "";
    }
    if(!Number.isNaN(n)){
        //Case is number check if is a number passed a param
        result =req.url?.includes('?') ? renderListResponse([]) : {};
    }else{
        //Case final number not is number return a expected object
        result = {};
    }
    return JSON.stringify(result);
}
function renderListResponse(list:any[]){
    return {
        meta:{current_page:1,from:1,last_page:1,per_page:10,to:10,total:list.length},
        data:list
    }
}
function TestFinishEvent(afterIntercepts:()=>void | Promise<void>,onTestFinish:()=>void){
    let isFinishedIntercepts = false;
    let isFinishedMainTest = false;
    return {
        async finishedIntercepts(){
            let res = afterIntercepts();
            if(res instanceof Promise){
                await res;
            }
            isFinishedIntercepts = true;
            if(isFinishedMainTest){
                onTestFinish();
            }
        },
        mainTestEnd(){
            isFinishedMainTest = true;
            if(isFinishedIntercepts){
                onTestFinish();
            }
        }
    }
}
function jsonRes(res:ServerResponse,data:any){
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(data);
}