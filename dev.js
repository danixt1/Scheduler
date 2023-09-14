import { exec, spawn } from 'child_process';
import {existsSync, readFileSync, writeFileSync,createWriteStream} from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {get} from 'http';
let envData = {};
(async()=>{
    //Script to run all cmds needed in dev
    if(!existsSync('node_modules')){
        console.log('Installing node modules ...');
        execAndWait('npm install');
    }
    if(!existsSync('vendor')){
        console.log('Installing composer modules ...');
        execAndWait('composer install');
    }
    
    if(!existsSync('.env')){
        log('init','.env file not exist. creating...');
        writeFileSync('.env',
        'APP_NAME=Laravel\nAPP_ENV=local\nAPP_KEY=\nAPP_DEBUG=true\nAPP_URL=http://localhost',
        {encoding:'utf-8',flag:'w'});
        readEnv(readFileSync('.env',{encoding:'utf-8'}));
        await envCompleter();
        log('init','Preparing database...');
        await execAndWait('php artisan migrate');
    }
    envData = readEnv(readFileSync('.env',{encoding:'utf-8'}));
    await envCompleter('before continue, please answer some question to pass to .env');
    //Check if db is running
    await new Promise((res=>{
        if(envData['DB_CONNECTION'] === 'sqlite'){
            res(true);
            return;
        }
        callToDB().on('error',(e)=>{
            switch (e.code) {
                case 'ECONNREFUSED':
                    log('init','DB not started awaiting for DB...');
                    checkRes();
                    function checkRes(){
                        callToDB().on('error',(e)=>{
                            if(e.code === 'ECONNREFUSED'){
                                setTimeout(checkRes,300);
                            }else{
                                log('init','DB started!');
                                setTimeout(()=>res(true),800);
                            }
                        })
                    }
                    break;
                case 'EPROTO':
                    res(true);
                    break;
                default:
                    log('init','unexpected response on checking DB ... skipping');
                    res(true);
                    break;
            }
        
        })
        function callToDB(){
            return get({
                href:'http://'+envData['DB_HOST'],
                port:envData['DB_PORT']
            })
        }
    }))
    run();
})();

function run(){
    log('init','starting artisan and vite');

    const phpServer =spawn('php',['artisan', 'serve']);
    const vite = spawn('npx',['vite']);
    phpServer.stdout.once('data',artisanReady);
    vite.stdout.on('data',viteReady);
    vite.stdout.on('data',(e)=>{
        let msg = e.toString();
        let reload = msg.indexOf('page reload');
        if(reload != -1){
            log('vite',msg.slice(reload));
        }
    })
    function artisanReady(e){
        let runningMessage = e.toString();
        let start = runningMessage.indexOf('[');
        let end = runningMessage.indexOf(']');
        if(start === -1 || end == -1){
            failed('Failed starting artisan, returned:\n'+runningMessage);
        }
        let server = runningMessage.slice(start + 1,end);
        log('artisan','Running artisan serve in '+server);
    }
    function viteReady(e){
        let msg = e.toString();
        let local = msg.match(/Local:[\s\t]+(.+)/);
        if(!local){
            return;
        }
        log('vite','running vite server in '+local[1]);
        vite.stdout.removeListener('data',viteReady);
    }
    function killAll(){
        phpServer.kill();
        vite.kill();
    }
    function failed(error){
        killAll();
        throw typeof error === 'string' ?new Error(error) : error;
    }
    ['exit','SIGUSR1','SIGUSR2','uncaughtException'].forEach(e =>{
        process.on(e,killAll);
    })
}
/**@param {string} envString */
function readEnv(envString){
    let actEnv = {};
    let lines = envString.split('\n');
    for(const line of lines){
        let eqPos = line.indexOf('=');
        if(eqPos < 1){
            continue;
        };
        let propName = line.substring(0,eqPos);
        let value = line.substring(eqPos+1).match(/\s*(.+)/);
        let finalValue = '';
        if(value){
            finalValue = value[1];
        };
        actEnv[propName] = finalValue;
    }
    return actEnv;
}
function log(from,message){
    let date = new Date();
    console.log(
        `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())} [${from}] ${message}`);
    function twoDigits(val){
        return val < 10 ? '0'+val : ''+val;
    }
}
async function envCompleter(intro,env = '.env'){
    let isFirst = true;
    let checkFor = {
        'DB_CONNECTION':['database type','sqlite'],
    };
    let noSqlite = {
        'DB_USERNAME':['database username','root'],
        'DB_DATABASE':['database','Scheduler'],
        'DB_PASSWORD':['db password'],
        'DB_HOST':['db host','127.0.0.1'],
        'DB_PORT':['db port','3306']
    }
    let sqlite = {
        'DB_DATABASE':['database file(default save in database folder):','server.sqlite']
    }
    await make(checkFor);
    if(envData['DB_CONNECTION'] != 'sqlite'){
        await make(noSqlite);
    }else{
        await make(sqlite);
    }
    if(!envData['APP_key']){
        log('init','App key not generated, generating ...');
        await execAndWait('php artisan key:generate');
    }
    async function make(checks){
        let finalText = '\n';
        for(const [nameChecker,qstData] of Object.entries(checks)){
            if(envData[nameChecker] == undefined){
                let init = '';
                if(isFirst && intro){
                    init =intro;
                }
                let resp = await question(init + '\n'+ qstData[0],qstData[1] || '');
                envData[nameChecker] = resp;
                finalText +=nameChecker + '='+resp+'\n';
            };
        };
        writeFileSync(env,finalText,{encoding:'utf-8',flag:'a+'});
    }
}
function execAndWait(cmd){
    log('init','running cmd:'+cmd + ' ...');
    return new Promise(end =>{
        exec(cmd,(e)=>{
            if(e){
                throw e;
            }
        }).on('exit',()=>{
            log('init','Done!');
            end();
        })
    })
}
async function question(text,def = ''){
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(text + (def ? `[${def}]:\n` : ':\n'));
    rl.close();
    return answer ? answer : def;
}