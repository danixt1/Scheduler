<?php 
namespace App\Events\Scheduler\Location;

use App\Events\Scheduler\EventData;
use App\Events\Scheduler\ProcessResult;
use GuzzleHttp\Exception\TransferException;
use GuzzleHttp\Promise\Promise;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;

class HttpRequestMode extends LocationProcessor{
    private string $method;
    private string $url;
    private array $sendHeaders;
    private array $data;
    private string $sendDataIn;

    const DEF_HEADERS = [
        'User-Agent'=>'Scheduler'
    ];

    public function __construct(bool $isFallback,string $data,EventData $evData,private \Closure $reporter){
        $data = json_decode($data);
        $this->url = $data['u'];
        $this->data = $evData;

        $this->unwrap_m($data);
        $this->unwrap_d($data);
        $this->unwrap_h($data);

        parent::__construct($isFallback,$data,$reporter);
    }
    public function isAsync(): bool{
        return true;
    }
    public function run(): ProcessResult | Promise{
        $client = new \GuzzleHttp\Client();
        $dataMode = $this->sendDataIn;
        $headers = array_merge($this->sendHeaders,$this::DEF_HEADERS);
        $body = null;
        $query = '';

        if($dataMode == 'json'){
            $headers["Content-Type"] = "application/json";
            $body = $this->data;
        }
        if($dataMode == 'query'){
            $query ='?'.http_build_query($this->data);
        }

        $request = new Request($this->method,$this->url + $query,$headers,$body);

        $prms = $client->sendAsync($request,["timeout"=>0.5]);
        $prms->then(function(Response $response){
            $status =$response->getStatusCode();
            $errorCode = 0;
            $msg = '';
            $body = $response->getBody();
            $size = $body->getSize();
            if($body->isReadable() && $size != null && $size > 0){
                try{
                    $msg = $body->read($size);
                }catch(\RuntimeException){
                    $msg = "Body not readable";
                    $errorCode = 2;
                };
            };
            if($status >= 400){
                $errorCode = 1;
                $msg = "Failed sending request, code:$status, Url:".$this->url;
            }
            $this->finish(new ProcessResult($errorCode,$msg));

        },function($e){
            if($e instanceof TransferException){
                $this->finish(new ProcessResult(2,"timeout"));
                return;
            }
            $this->finish(new ProcessResult(3,"Unknow error"));
        });
        return $prms;
    }
    
    private function unwrap_h(&$data){
        $this->sendHeaders = isset($data['h']) ? (array)$data['h'] : [];
    }
    private function unwrap_m(&$data){
        $this->method = isset($data['m']) ? $data['m'] : 'GET';
    }
    private function unwrap_d(&$data){
        $this->sendDataIn = (isset($data['d']) ? $data['d'] : 'default') == 'default' ? ($this->method == 'POST' ? 'json' : 'query') : $data['d'];
    }
}