import { assert, describe, expect, it } from 'vitest';
import { ApiItem } from '../../Api/Api';
import { fireEvent, render,screen } from '@testing-library/react';
import { FormBuilder } from '../../Components/Creater/Forms';
import { createServer } from 'http';
type FormElem = (props:FormBuilder<any>)=>JSX.Element;

interface EditStructure{
    apiItem:ApiItem<Record<any,any>>
    additionalRequests:{path:string,value:any | any[],required:boolean}[]
    form:FormElem
    afterFormRender:(baseElem:HTMLElement)=>Promise<void>
}

export function MakeFormEditTest(itemApi:ApiItem<Record<any,any>>,form:FormElem){
    let structure:EditStructure = {
        apiItem:itemApi,
        additionalRequests:[],
        form:form,
        afterFormRender:async ()=>{}
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
                    let server = createServer((req,res)=>{
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
                            server.close(testEnd);
                        })
                        res.writeHead(200).end();
                    })
                    server.listen(9543,()=>{
                        this.renderAndClick(form,apiItem,afterFormRender);
                    });
                });
            },
            makeRequestTest(testName:string,expectedPath:string){
                let {form, apiItem,afterFormRender} = actStr;
                test(testName,(testEnd)=>{
                    let server = createServer((req,res)=>{
                        assert.equal(req.url,expectedPath);
                        res.end();
                        server.close(testEnd);
                    });
                    server.listen(9543,()=>{
                        this.renderAndClick(form,apiItem,afterFormRender);
                    });
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