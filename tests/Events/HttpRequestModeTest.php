<?php
namespace Tests\Events;

use App\Events\Scheduler\DbBulk;
use App\Events\Scheduler\EventData;
use App\Events\Scheduler\Location\HttpRequestMode;
use App\Events\Scheduler\ProcessResult;

class HttpRequestModeTest extends \Tests\TestCase{
    use GuzzleHttpTestTrait;

    public static function getEvent(){
        return new EventData(0,1,new DbBulk,json_encode(["name","desc"]));
    }
    public function test_sended_message_to_url(){
        $url = "https://test.com";

        $handler = new GuzzleHttpTestHandler();

        $mode = new HttpRequestMode(false,json_encode(["u"=>$url,"m"=>"GET"]),$this::getEvent(),function($a){$this->fail("Not expected report to callback");});

        $prms =$mode->run();
        $prms->wait();
        $result = $mode->getProcessingResult();
        $this->assertNotNull($result,"Processing Result not defined after running");
        $this->assertFalse($result->failed());
        $this->assertSendedRequestTo($handler,$url.'?name=name&description=desc');
    }
    public function test_call_callback_on_fail(){
        $url = "https://test.com";
        $handler = new GuzzleHttpTestHandler();
        $handler->add($url."*","500");
        $called = false;
        $callback = function(ProcessResult $result) use(&$called){
            $this->assertTrue($result->failed(),"Expected to have failed in the test");
            $called = true;
        };
        $mode = new HttpRequestMode(false,json_encode(["u"=>$url,"m"=>"GET"]),$this::getEvent(),$callback);

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

        $handler = new GuzzleHttpTestHandler();
        $mode = new HttpRequestMode(false,json_encode(["u"=>$url,"m"=>"POST","d"=>"json"]),$this::getEvent(),function($a){$this->fail("Not expected report to callback");});

        
        $prms =$mode->run();
        $prms->wait();
        $result = $mode->getProcessingResult();
        $this->assertNotNull($result,"Processing Result not defined after running");
        $this->assertFalse($result->failed());
        $this->assertSendedRequestTo($handler,$url);
        $request = $handler->getAllRequests()[0];
        $this->assertEqualsCanonicalizing(["name"=>"name","description"=>"desc"],(array)json_decode($request->getBody()));

    }
}