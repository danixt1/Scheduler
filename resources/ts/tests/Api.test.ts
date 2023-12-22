import { expect, it, describe,beforeAll, assert, afterAll, afterEach } from 'vitest'
import {createServer} from 'http';
import { buildApi } from '../Api/Conector';
import { listenToServer } from './Utils';
let API_URL = 'http://localhost:9423/';
describe('Api',()=>{
    let server = createServer((req,res)=>{actualTest(req,res)})
    let actualTest:Exclude<Parameters<typeof createServer>[1],undefined> = ()=>{}
    beforeAll(async ()=>{
        API_URL ='http://localhost:'+ await new Promise<number>(res =>{
            listenToServer(server,res);
        })
        API_URL += '/';
    });
    afterEach(()=>{
        actualTest = (req,res)=>{
            switch(req.method){
                case 'GET':
                    if(req.url){
                        let last = req.url[req.url.length - 1];
                        if(!Number.isNaN(Number.parseInt(last))){
                            jsonRes(res,{a:22});
                            return;
                        }
                    }
                    jsonRes(res,[]);
                    break;
            }
        }
    })
    it('correct create functions linking the path',()=>{
        let api = buildApi({url:API_URL},{
            'mapped/to/that':'inApi',
            'other/path':'fn'
        });
        assert.hasAllKeys(api,['fn','inApi']);
    })
    it('[GET] send request to correct path',async ()=>{
        let urlPassed = '';
        actualTest =(req,res)=>{
            urlPassed = req.url || '';
            jsonRes(res,renderListResponse([{url:req.url}]));
        };
        let api =buildApi(API_URL,{
            'easy':'test1',
        });
        let ret = await api.test1();
        assert.equal(urlPassed,'/easy','invalid passed path, passed: '+urlPassed);
        assert.typeOf(ret.list,'array','returned list not is array');
    })
    it('[POST] make create request on data passed',async ()=>{
        let method = '';
        actualTest = (req,res)=>{
            if(req.method === 'GET'){
                jsonRes(res,{a:22});
            }
            if(req.method === 'POST'){
                method = req.method;
                jsonRes(res,1);
            }
        }
        let api =buildApi<{a:number},{a:number}>(API_URL,{'easy':'test1'});
        let res =await api.test1({a:22});
        assert.equal(method,'POST');
        assert.equal(res.a,22);
    })
    it('[POST] update object with id passed',async ()=>{
        let calledInPost = '';
        let passedData = '';
        let passedPost = false;
        actualTest = (req,res)=>{
            if(req.method === 'POST'){
                passedPost = true;
                calledInPost = req.url || '';
                req.on('data',e =>{
                    passedData += e.toString();
                });
                res.statusCode = 204;
                res.end();
                return;
            }else{
                jsonRes(res,{id:2,name:'test name'});
            }
        };
        let api =buildApi<{name:string}>(API_URL,{'easy':'test1'});
        await api.test1({id:2,name:'test name'});
        assert.equal(calledInPost,'/easy/2','Incorrect url');
        assert(passedPost,'Incorrect method');
        assert.deepEqual({name:'test name'},JSON.parse(passedData));
    })
    it('[DELETE] send request to delete the item',async ()=>{
        let passedUrl = '';
        let method = '';
        actualTest = (req,res)=>{
            passedUrl = req.url || '';
            method = req.method || '';
            res.statusCode = 201;
            res.end();
        }
        let api =buildApi<{name:string}>(API_URL,{'easy':'test1'});
        await api.test1.delete(1);
        assert.equal(passedUrl,'/easy/1');
        assert.equal(method,'DELETE');
    });
    afterAll(()=>{
        return new Promise(res =>{
            server.close((e)=>{
                res();
            })
        })
    })
})
function jsonRes(res:any,data:any){
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(data));
}
function renderListResponse(list:any[]){
 return {data:list,meta:{current_page:1,from:1,last_page:1,per_page:10,to:10,total:list.length}}
}