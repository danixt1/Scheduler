import {Server,IncomingMessage,ServerResponse} from 'http';

let portToTry = 9000;
/**
 * Use this function to listen to server, it's avoid socket problems on activating `server.close()`
 * @see https://github.com/nodejs/help/issues/4080
 */
export function listenToServer(server:Server<typeof IncomingMessage, typeof ServerResponse>,callback:(port:number)=>void){
    server.on('error',(err:any)=>{
        if(err.code === 'EADDRINUSE'){
            
            portToTry++;
            console.log('Address In Use, checking ',portToTry);
            setImmediate(()=>{
                server.close(()=>{
                    tryListening();
                })
            })
        }
    })
    tryListening();
    function tryListening(){
        server.listen(portToTry,()=>{callback(portToTry);portToTry++});
    }
}