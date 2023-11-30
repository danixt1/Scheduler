import { assert, describe, it } from "vitest";
import {createServer }from "http";
import { buildApi } from "../Api/Conector";
import { EditListContext, ResourceList } from "../Components/ResourceList/Parts";
import { render,screen,fireEvent } from "@testing-library/react";

const DEF_PORT = 9423;
const API_URL = "http://localhost:"+DEF_PORT;

describe('ResourceList',()=>{
    it('show the elements in list',()=>{
        const PREFIX = "@item-test";
        return new Promise((res,rej) =>{
            let a = [
                {name:PREFIX + '1'},
                {name:PREFIX + '2'}
            ]
            let server = createServer((req,res)=>{
                responseList(res,a);
            });
            server.on('error',()=>{
                rej();
                server.close();
            })
            server.listen(DEF_PORT,async ()=>{
                let api = buildApi({url:API_URL},{
                    test:"test"
                });
                render(<ResourceList api={api.test} propsToreturn={["name"]} />);
                try{
                    await screen.findByText(PREFIX + '1');
                    await screen.findByText(PREFIX+'2');
                }catch(e){
                    server.close(()=>{
                        rej(e);
                    })
                }
                server.close(res);
            })

        })
    });
    it('delete the element',()=>{
        return new Promise((resolve,rej)=>{
            const ITEM_NAME = '@item-to-delete@';
            let timeout:any = 0;
            let item = {name:ITEM_NAME,id:0};
            let server = createServer((req,res)=>{
                if(req.method === "GET"){
                    responseList(res,[item]);
                    return;
                }
                res.end();
                if(req.method === "DELETE" && req.url?.endsWith('0')){
                    server.close(()=>{
                        clearTimeout(timeout);
                        resolve(true);
                    })
                    return;
                }
                server.close(()=>{
                    rej("invalid request");
                })
            });
            server.listen(DEF_PORT,async ()=>{
                let api = buildApi({url:API_URL},{
                    test:"test"
                });
                const {container} = render(<ResourceList api={api.test} propsToreturn={['name']}/>)
                try{
                    await screen.findByText(ITEM_NAME);
                    let checkbox = container.getElementsByClassName('rl-checkbox')[0];
                    let ok =fireEvent.click(checkbox);
                    let delBtn = container.getElementsByClassName('rl-delete')[0];
                    let ok2 = fireEvent.click(delBtn);
                    if(!(ok && ok2)){
                        throw new Error("Failed Click Event");
                    }
                    timeout = setTimeout(()=>{
                        server.close(()=>{rej("timeout")});
                    },100);
                }catch(e){
                    server.close(()=>{rej(e)});
                }
            })
        })
    })
    it('active edit context',async ()=>{
        const DEF_NAME = 'testing@';
        let finish:any = null;
        let server = createServer((req,res)=>{
            responseList(res,[{name:DEF_NAME,id:0}]);
        })
        await new Promise<void>(res=>{
            server.listen(DEF_PORT,res);
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
        await new Promise(res =>server.close(res));
    })
    it('add new colums to show',async ()=>{
        const DEF_NAME = 'testing@';
        const DEF_SECOND = 'testrng2';
        let server = createServer((req,res)=>{
            responseList(res,[{name:DEF_NAME,id:0,data:{a:11,b:DEF_SECOND}}]);
        })
        await new Promise<void>(res =>{
            server.listen(DEF_PORT,res);
        });
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
            await new Promise(res =>server.close(res));
            throw e;
        }
        await new Promise(res =>server.close(res));
    })
})
function responseList(res:any,list:any[]){
    res.writeHead(200, { 'Content-Type': 'application/json' }).
    end(JSON.stringify(renderListResponse(list)));
}
function renderListResponse(list:any[]){
    return {data:list,meta:{current_page:1,from:1,last_page:1,per_page:10,to:10,total:list.length}}
}