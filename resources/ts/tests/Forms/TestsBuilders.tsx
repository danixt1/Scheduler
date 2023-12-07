import { afterAll, afterEach, assert, beforeAll, describe, expect, it } from 'vitest';
import { ApiItem } from '../../Api/Api';
import { fireEvent, render,screen } from '@testing-library/react';
import { FormBuilder } from '../../Components/Creater/Forms';
import { createServer,IncomingMessage } from 'http';
import axios from 'axios';
//Remake the server to continue opened after the test end
type FormElem = (props:FormBuilder<any>)=>JSX.Element;
const DEF_PORT = 9543;
interface EditStructure{
    apiItem:ApiItem<Record<any,any>>
    additionalRequests:{path:string,value:any | any[],required:boolean}[]
    form:FormElem
    afterFormRender:(baseElem:HTMLElement)=>Promise<void>
}

export function TestWorkbanchFormEdit(itemApi:ApiItem<Record<any,any>>,form:FormElem){
    let onRequest:Exclude<Parameters<typeof createServer>[1],undefined> = (req,res)=>{res.writeHead(200, { 'Content-Type': 'application/json' }).end(renderResponseTo(req))}
    let server = createServer((req,res)=>{
        onRequest(req,res);
    })
    let defReq = (req:any,res:any)=>{
        console.log("Request called not inside in test:" + req.url);
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(renderResponseTo(req));
    };
    beforeAll(()=>{
        return new Promise((res)=>{
            server.listen(DEF_PORT,res);
        })
    })
    afterEach(()=>{
        onRequest = defReq;
    })
    afterAll(()=>{
        return new Promise<any>((res)=>{
            //wait to detect if is request anything after the tests.
            setTimeout(()=>{
                server.close(res);
            },100);
        })
    })
    let structure:EditStructure = {
        apiItem:itemApi,
        additionalRequests:[],
        form:form,
        afterFormRender:async ()=>{}
    }
    function test(name:string,fn:(res:()=>void)=>void){
        it(name,()=>{
            axios.defaults.baseURL = "http://localhost:"+ DEF_PORT;
            return new Promise<void>((res=>{
                fn(res);
            }))
        })
    }
    function makeThis(actStr:EditStructure,base?:EditStructure){
        return {
            makeComparationTest(expectedFinalResult:any,testName:string){
                let {form, apiItem,additionalRequests:requests,afterFormRender} = actStr;
                //Get Base actual request and the new requests
                if(base){
                    requests = [...base.additionalRequests,...requests];
                }
                test(testName,(testEnd)=>{
                    let reqsToRun = requests.map<number>((e)=>e.required ? 1 : 0).reduce((a,b)=>a+b,0);
                    let allRequiredPasseds = reqsToRun === 0;
                    onRequest =(req,res)=>{
                        for(const resToRequest of requests){
                            if(resToRequest.path === req.url){
                                res.writeHead(200, { 'Content-Type': 'application/json' }).
                                end(JSON.stringify(resToRequest.value));
                                if(resToRequest.required){
                                    reqsToRun --;
                                    allRequiredPasseds = reqsToRun === 0;
                                }
                                return;
                            }
                        }
                        let data:string = "";
                        req.on('data',(e)=>{
                            data +=e;
                        })
                        req.on('end',()=>{
                            if(req.method == "GET"){
                                return;
                            }
                            let jsonData = JSON.parse(data);
                            assert.deepEqual(jsonData,expectedFinalResult,"Have diference with the expected final result");
                            testEnd();
                        })
                        res.writeHead(200).end();
                    }
                });
            },
            testRequest(testName:string,expectedPath:string){
                let {form, apiItem,afterFormRender,additionalRequests:requests} = actStr;
                if(base){
                    requests = [...base.additionalRequests,...requests];
                }
                test(testName,(testEnd)=>{
                    let havePassedInAssert = false;
                    onRequest = (req,res)=>{
                        for(const resToRequest of requests){
                            if(resToRequest.path === req.url){
                                let value = resToRequest.value;
                                let send =Array.isArray(value) ? renderListResponse(value) : value;
                                res.writeHead(200, { 'Content-Type': 'application/json' }).
                                end(JSON.stringify(send));
                                return;
                            }
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' }).end(renderResponseTo(req));
                        if(!havePassedInAssert){
                            havePassedInAssert = true;
                            assert.equal(req.url,expectedPath);
                            testEnd();
                        }else{
                            console.warn("A not expected request has been passed after the end of the request.\n request to path:"+req.url);
                        }
                    };
                    this.renderAndClick(form,apiItem,afterFormRender);
                });
                return this;
            },
            async renderAndClick(Elem:FormElem = actStr.form,apiItem:ApiItem<Record<any, any>> =actStr.apiItem,afterRender = actStr.afterFormRender ){
                const {container}= render(<Elem apiItem={apiItem} />);
                await afterRender(container);
                let elem =container.getElementsByClassName("inp-creater")[0];
                assert.isNotNull(elem,"Submit button not found");
                assert(fireEvent.click(elem),"Not clicked in element");
                return container;
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
            afterRender(fn:(baseElem: HTMLElement) => Promise<void>){
                actStr.afterFormRender = fn;
                return this;
            },
            addResponse(path:string,resp:any | any[],required:boolean =false){
                actStr.additionalRequests.push({path,value:resp,required});
                return this;
            }
        }
    }
    return makeThis(structure)
}
function renderResponseTo(req:IncomingMessage){
    let final =req.url ? req.url[req.url.length - 1] : '';
    let n = Number.parseInt(final);
    let result:any = "";
    if(req.method === "GET"){
        return "";
    }
    if(!Number.isNaN(n)){
        result =req.url?.includes('?') ? renderListResponse([]) : {};
    }else{
        result = {};
    }
    return JSON.stringify(result);
}
function renderListResponse(list:any[]){
    return {
        data:{
            meta:{current_page:1,from:1,last_page:1,per_page:10,to:10,total:list.length},
            data:list
        }
    }
}