<?php

namespace Tests\Events;

use GuzzleHttp\Psr7\Response;

class GuzzleHttpTestHandler{
    private $locs = [];
    private $nonExplicitLocations = [];
    private $urlWithRequestList = [];
    private $count = 0;
    public function __construct($autoDefineClient = true,private $defReturn = new Response){
        if($autoDefineClient){
            $client = new \GuzzleHttp\Client(['handler'=>$this]);
            \App\Events\Scheduler\Location\HttpRequestMode::setDefaultClient($client);
        }
    }
    public function add($url,$response = "success"){
        if(is_string($response)){
            $modes = [
                "success"=>new Response,
                "timeout"=>new \GuzzleHttp\Exception\TransferException,
                "500"=>new Response(500)
            ];
            $response = $modes[$response];
        };
        if(!$response){
            $response = new Response;
        }
        $this->locs[$url] = $response;
    }
    public function __invoke(\Psr\Http\Message\RequestInterface $requestInterface,array $options){
        $fullUrl = "".$requestInterface->getUri();
        $this->count++;
        foreach ($this->locs as $url => $data) {
            if($this->checkString($url,$fullUrl)){
                return $this->activateResponseData($data,$requestInterface,$fullUrl);
            }
        }
        $this->nonExplicitLocations[] = [$fullUrl,$requestInterface];
        return $this->activateResponseData($this->defReturn,$requestInterface,$fullUrl);
    }
    public function countRequests(){
        return $this->count;
    }
    public function getRequestsFromUrl($url){
        $reqs = [];
        foreach ($this->urlWithRequestList as $value) {
            $actUrl = $value[0];
            if($this->checkString($url,$actUrl)){
                $reqs[] = $value[1];
            }
        }
        return $reqs;
    }
    public function getAllRequests(){
        return array_map(function(array $urlAndRequest){return $urlAndRequest[1];},$this->urlWithRequestList);
    }
    private function checkString($from,$compareTo){
        if(str_starts_with($from,"/") && preg_match($from,$compareTo)){
            return true;
        };
        $from ="/" . str_replace([".","/","*","?"],["\\.","\/",".*","\?"],$from) . "/";
        return preg_match($from,$compareTo);
    }
    private function activateResponseData($data,$request,$url){
        $response = $data;
        if(is_callable($data)){
            $response = $data($request);
        }
        $this->urlWithRequestList[] = [$url,$request];
        return $this->getTypePromise($response);
    }
    private function getTypePromise($response){
        $prms = $response instanceof \Throwable ? 
        \GuzzleHttp\Promise\Create::rejectionFor($response) : 
        \GuzzleHttp\Promise\Create::promiseFor($response);

        return $prms->then(function($value){return $value;},function($value){return \GuzzleHttp\Promise\Create::rejectionFor($value);});
    }
}