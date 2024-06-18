<?php

use App\Events\Scheduler\DbBulk;
use App\Events\Scheduler\EventData;
use App\Events\Scheduler\Location\HttpRequestMode;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;

class HttpRequestModeTest extends \Tests\TestCase{
    public static function getEvent(){
        return new EventData(0,1,new DbBulk,json_encode(["name","desc"]));
    }
    public static function createMockClient(HttpRequestMode $req,MockHandler $mock){
        $handler = HandlerStack::create($mock);
        $client = new Client(['handler'=>$handler]);
        $req->setClient($client);
        return $handler;
    }
    public function test_sended_message_to_url(){
        $url = "https://test.com";

        $mock = new MockHandler([
            new Response()
        ]);
        $container = [];
        $history = Middleware::history($container);

        $mode = new HttpRequestMode(false,json_encode(["u"=>$url,"m"=>"GET"]),$this::getEvent(),function($a){$this->fail("Not expected report to callback");});

        $this->createMockClient($mode,$mock)->push($history);
        
        $prms =$mode->run();
        $prms->wait();
        $result = $mode->getProcessingResult();
        $this->assertNotNull($result,"Processing Result not defined after running");
        $this->assertFalse($result->failed());
        $req = $container[0]['request'];
        $this->assertEquals($url.'?name=name&description=desc',$req->getUri());
    }
    public function test_call_callback_on_fail(){
        $url = "https://test.com";
        $called = false;
        $mock = new MockHandler([
            new Response(400)
        ]);
        $callback = function() use(&$called){
            $called = true;
        };
        $mode = new HttpRequestMode(false,json_encode(["u"=>$url,"m"=>"GET"]),$this::getEvent(),$callback);

        $this->createMockClient($mode,$mock);

        $prms =$mode->run();
        try{
            $prms->wait();
        }catch(\Exception){
            //Expected
        };
        $this->assertNotNull($mode->getProcessingResult(),"Processing Result not defined after running");
        $this->assertTrue($called,"Callback not called");
    }
    public function test_post_request_with_json(){
        $url = "https://test.com";

        $mock = new MockHandler([
            new Response()
        ]);
        $container = [];
        $history = Middleware::history($container);

        $mode = new HttpRequestMode(false,json_encode(["u"=>$url,"m"=>"POST","d"=>"json"]),$this::getEvent(),function($a){$this->fail("Not expected report to callback");});

        $this->createMockClient($mode,$mock)->push($history);
        
        $prms =$mode->run();
        $prms->wait();
        $result = $mode->getProcessingResult();
        $this->assertNotNull($result,"Processing Result not defined after running");
        $this->assertFalse($result->failed());
        $req = $container[0]['request'];
        $this->assertEquals($url,$req->getUri());
        $this->assertEqualsCanonicalizing(["name"=>"name","description"=>"desc"],(array)json_decode($req->getBody()));

    }
}