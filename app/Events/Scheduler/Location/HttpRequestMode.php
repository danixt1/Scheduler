<?php 
namespace App\Events\Scheduler\Location;

use App\Events\Scheduler\EventData;
use App\Events\Scheduler\ProcessResult;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;

class HttpRequestMode extends LocationProcessor{
    private static $defClient = null;
    private string $method;
    private string $url;
    private array $sendHeaders;
    private string $sendDataIn;
    private $client;

    const DEF_HEADERS = [
        'User-Agent'=>'Scheduler'
    ];

    public function __construct(bool $isFallback,string $data,private EventData $evData,private \Closure $reporter){
        $this->client =self::$defClient ?? new \GuzzleHttp\Client();
        $data = json_decode($data);
        $this->url = $data->u;

        $this->unwrap_m($data);
        $this->unwrap_d($data);
        $this->unwrap_h($data);

        parent::__construct($isFallback,(array)$data,$reporter);
    }
    public function isAsync(): bool{
        return true;
    }
    public function run():\GuzzleHttp\Promise\PromiseInterface{
        $client = $this->client;
        $dataMode = $this->sendDataIn;
        $headers = array_merge($this->sendHeaders,$this::DEF_HEADERS);
        $body = null;
        $query = '';
        $data = $this->evData->get();

        if($dataMode == 'json'){
            $headers["Content-Type"] = "application/json";
            $body = $data;
        }
        if($dataMode == 'query'){
            $query ='?'.http_build_query($data);
        }

        $request = new Request($this->method,$this->url . $query,$headers,$body ? json_encode($body) : null);

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
            if($e instanceof \GuzzleHttp\Exception\TransferException){
                $this->finish(new ProcessResult(2,"timeout"));
                return;
            }
            $this->finish(new ProcessResult(3,"Unknow error"));
        });
        return $prms;
    }
    public function setClient(\GuzzleHttp\Client $client){
        $this->client = $client;
    }
    public static function setDefaultClient(\GuzzleHttp\Client $client){
        self::$defClient = $client;
    }
    private function unwrap_h(&$data){
        $this->sendHeaders = isset($data->h) ? (array)$data->h : [];
    }
    private function unwrap_m(&$data){
        $this->method = isset($data->m) ? $data->m : 'GET';
    }
    private function unwrap_d(&$data){
        $this->sendDataIn = (isset($data->d) ? $data->d : 'default') == 'default' ? ($this->method == 'POST' ? 'json' : 'query') : $data->d;
    }
}