import { afterEach, assert, beforeEach, describe, it } from "vitest";
import {createServer }from "http";
import { buildApi } from "../Api/Conector";
import { EditListContext, ResourceList } from "../Components/ResourceList/Parts";
import { render,screen,fireEvent } from "@testing-library/react";

const DEF_PORT = 9424;//FIXME Check server not closing in Api.test.ts
const API_URL = "http://localhost:"+DEF_PORT;

describe('ResourceList',()=>{
    let server:ReturnType<typeof createServer>;
    beforeEach(()=>{
        server = createServer();
        return new Promise<void>(res =>{
            server.listen(DEF_PORT,res);
        })
    })
    afterEach(async ()=>{
        if(server.listening){
            await new Promise<any>(res =>{
                server.close(res);
            })
        }
    })
    it('show the elements in list',async()=>{
        const PREFIX = "@item-test";
        let a = [
            {name:PREFIX + '1'},
            {name:PREFIX + '2'}
        ]
        server.on('request',(req,res)=>{
            responseList(res,a);
        });
        let api = buildApi({url:API_URL},{
            test:"test"
        });
        render(<ResourceList api={api.test} propsToreturn={["name"]} />);
        await screen.findByText(PREFIX + '1');
        await screen.findByText(PREFIX+'2');
        assert(true);
    });
    it('delete the element',()=>{
        const ITEM_NAME = '@item-to-delete@';
        return new Promise<void>((resolve,rej)=>{
            let timeout:any = 0;
            let item = {name:ITEM_NAME,id:0};
            server.on('request',(req,res)=>{
                if(req.method === "GET"){
                    responseList(res,[item]);
                    return;
                }
                res.end();
                if(req.method === "DELETE" && req.url?.endsWith('0')){
                    clearTimeout(timeout);
                    resolve();
                    return;
                }
                rej("invalid request");
            });
            (async ()=>{
                let api = buildApi({url:API_URL},{
                    test:"test"
                });
                const {container} = render(<ResourceList api={api.test} propsToreturn={['name']}/>)
                try{
                    timeout = setTimeout(()=>{
                        rej("timeout")
                    },300);
                    await screen.findByText(ITEM_NAME);
                    let checkbox = container.getElementsByClassName('rl-checkbox')[0];
                    let ok =fireEvent.click(checkbox);
                    let delBtn = container.getElementsByClassName('rl-delete')[0];
                    let ok2 = fireEvent.click(delBtn);
                    if(!(ok && ok2)){
                        throw new Error("Failed Click Event");
                    }
                }catch(e){
                    rej(e)
                }
            })();
        })
    })
    it('active edit context',async ()=>{
        const DEF_NAME = 'testing@';
        let finish:any = null;
        server.on('request',(req,res)=>{
            responseList(res,[{name:DEF_NAME,id:0}]);
        })
        let api = buildApi({url:API_URL},{
            test:"test"
        });
        const {container}=render(
            <EditListContext.Provider value={(e)=>{
                finish();
                assert.isTrue(e.name === DEF_NAME,"invalid returned name,\n EditList context is activated but the passed value is invalid");
            }}>
                <ResourceList api={api.test} propsToreturn={["name"]} />
            </EditListContext.Provider>
        )
        await screen.findByText(DEF_NAME);
        let editBtn = container.getElementsByClassName('rl-edit')[0];
        let finisher = new Promise<void>(((res,rej) =>{
            let timeout = setTimeout(rej,200);
            finish = ()=>{
                clearTimeout(timeout);
                res();
            }
            
        }))
        assert.isTrue(fireEvent.click(editBtn));
        await finisher;
    })
    it('add new colums to show',async ()=>{
        const DEF_NAME = 'testing@';
        const DEF_SECOND = 'testrng2';
        server.on('request',(req,res)=>{
            responseList(res,[{name:DEF_NAME,id:0,data:{a:11,b:DEF_SECOND}}]);
        })
        let api = buildApi({url:API_URL},{
            test:"test"
        });
        let columsToRender = {
            ["new@colum"](e:any){
                return e.data.a;
            },
            ["second@colum"](e:any){
                return e.data.b;
            }
        }
        const {container} = render(<ResourceList api={api.test} renderProp={columsToRender} propsToreturn={["name"]} />);
        try{
            await screen.findByText(DEF_SECOND);
            await screen.findByText("new@colum");
        }catch(e){
            throw e;
        }
    })
})
function responseList(res:any,list:any[]){
    res.writeHead(200, { 'Content-Type': 'application/json' }).
    end(JSON.stringify(renderListResponse(list)));
}
function renderListResponse(list:any[]){
    return {data:list,meta:{current_page:1,from:1,last_page:1,per_page:10,to:10,total:list.length}}
}