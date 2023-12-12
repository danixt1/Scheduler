import { afterAll, afterEach, assert, beforeAll, describe, expect, it } from 'vitest';
import { ApiItem } from '../../Api/Api';
import { RenderResult, act, fireEvent, render,screen } from '@testing-library/react';
import { FormBuilder } from '../../Components/Creater/Forms';
import { createServer,IncomingMessage,ServerResponse } from 'http';
import axios from 'axios';
//Remake the server to continue opened after the test end
type FormElem = (props:FormBuilder<any>)=>JSX.Element;
type ReqInfo = {path:string,value:any | any[],required:boolean};
const DEF_PORT = 9543;
interface EditStructure{
    apiItem:ApiItem<Record<any,any>>
    additionalRequests:ReqInfo[]
    form:FormElem
    afterFormRender:(baseElem:HTMLElement)=>Promise<void>
    afterIntercepts:()=>Promise<void> | void
}
const METHODS = ["GET","POST","DELETE","UPDATE"];
export function TestWorkbanchFormEdit(itemApi:ApiItem<Record<any,any>>,form:FormElem){
    let onRequest:Exclude<Parameters<typeof createServer>[1],undefined> = (req,res)=>{res.writeHead(200, { 'Content-Type': 'application/json' }).end(renderResponseTo(req))}
    let server = createServer((req,res)=>{
        onRequest(req,res);
    })
    let original = axios.defaults.baseURL;
    let defReq = (req:any,res:any)=>{
        console.log("Request called not inside in test:" + req.url);
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
        form:form,
        afterFormRender:async ()=>{},
        afterIntercepts:()=>{}
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
                                jsonRes(res,JSON.stringify(resToRequest.value));
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
                let {form, apiItem,afterFormRender,additionalRequests:requests,afterIntercepts} = actStr;
                if(base){
                    requests = [...base.additionalRequests,...requests];
                }
                test(testName,(testEnd)=>{
                    let havePassedInAssert = false;
                    let allInterceptHaveRunned = false;
                    let interceptor = RequestInteceptor(requests,()=>{
                        let prms =afterIntercepts();
                        if(prms instanceof Promise){
                            prms.then(next);
                        }else{
                            next();
                        }
                        function next(){
                            allInterceptHaveRunned = true;
                            checkFinish();
                        }
                    });
                    onRequest = (req,res)=>{
                        if(interceptor(req,res)){
                            return;
                        }
                        jsonRes(res,renderResponseTo(req));
                        if(!havePassedInAssert){
                            havePassedInAssert = true;
                            assert.equal(req.url,expectedPath);
                            res.on('finish',checkFinish);
                        }else{
                            console.warn("A not expected request has been passed after the end of the request.\n request to path:"+req.url);
                        }
                    };
                    this.renderAndClick(form,apiItem,afterFormRender);
                    function checkFinish(){
                        if(allInterceptHaveRunned && havePassedInAssert){
                            testEnd();
                        }
                    }
                });
                return this;
            },
            async renderAndClick(Elem:FormElem = actStr.form,apiItem:ApiItem<Record<any, any>> =actStr.apiItem,afterRender = actStr.afterFormRender ){
                const {container}= await  act<RenderResult>(()=>{
                    return render(<Elem apiItem={apiItem} />);
                })
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
            afterRequests(fn:()=>Promise<void> | void){
                actStr.afterIntercepts = fn;
                return this;
            },
            afterRender(fn:(baseElem: HTMLElement) => Promise<void>){
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
            ...e,
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
function jsonRes(res:ServerResponse,data:any){
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(data);
}