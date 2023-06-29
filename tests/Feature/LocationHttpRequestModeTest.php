<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Request;
use Tests\TestCase;
use App\Locations\HttpRequestMode;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\DataProvider;
use Throwable;

class LocationHttpRequestModeTest extends TestCase{

    public static function validationProvider():array{
        $vHeader = (object)['Auth'=>'as2sc1'];
        return [
            //Data to valid                         expected returned boolean
            [['u'=>'https://a.com'],               true ],
            [['u'=>'http://a.com'],                true ],
            [['u'=>'https://a.com','m'=>'POSTER'], false],
            [['m'=>'GET','h'=>$vHeader],           false],
            [['u'=>'mysql://db.com'],              false],
            [['u'=>'https://a.com','h'=>$vHeader], true ],
            [['u'=>11],                            false]
        ];
    }
    
    public function test_simple_request(): void{
        Http::preventStrayRequests();
        Http::fake([
            'https://fake-url.com'=>Http::response(null,200)
        ]);
        $req = new HttpRequestMode([
            'u'=>'https://fake-url.com',
        ]);
        $this->assertTrue($req->send([]));
    }
    /**
     * Test if have false positive
     */
    public function test_request_have_failed(): void{
        Http::preventStrayRequests();
        Http::fake([
            'https://fake-url.com'=>Http::response(null,301)
        ]);
        $req = new HttpRequestMode([
            'u'=>'https://fake-url.com',
        ]);
        $this->assertFalse($req->send([]));
    }
    public function test_method_is_correct_defined(): void{
        Http::fake(function (Request $req){
            return Http::response(null,$req->method() == 'POST'?200 : 300);
        });
        $req = new HttpRequestMode([
            'u'=>'https://test.com',
            'm'=>'POST'
        ]);
        $this->assertTrue($req->send([]),'Expected post in request');
    }
    public function test_headers_is_correct_passed():void{
        $header = ['test'=>'tested','other'=>'otherHead'];
        $existHeaders = false;
        Http::fake(function (Request $req) use($header,&$existHeaders){
            $existHeaders = $req->hasHeaders($header);
            return Http::response();
        });
        $req = new HttpRequestMode([
            'u'=>'https://test.com',
            'h'=>(object)$header
        ]);
        $this->assertTrue($req->send([]));
        $this->assertTrue($existHeaders,"Headers not passed");
    }
    public function test_headers_defined_dont_replace_protected_headers():void{
        $header = ['User-Agent'=>'Test'];
        $existHeaders = false;
        Http::fake(function (Request $req) use($header,&$existHeaders){
            $existHeaders = $req->hasHeaders($header);
            return Http::response();
        });
        $req = new HttpRequestMode([
            'u'=>'https://test.com',
            'h'=>(object)$header
        ]);
        $this->assertTrue($req->send([]));
        $this->assertFalse($existHeaders,"protected header has replaced");
    }

    public function test_passed_data_in_body(): void{
        $result =  '';
        Http::fake(function(Request $req) use (&$result){
            $result = json_decode($req->body());
            return Http::response();
        });
        $obj = [
            'passed'=>'info',
            'id'=>1
        ];
        $req = new HttpRequestMode([
            'u'=>'https://test.com',
            'm'=>'POST',
            'd'=>'json'
        ]);
        $this->assertTrue($req->send($obj),'request failed');
        $this->assertEqualsCanonicalizing((array) $result, $obj);
    }
    public function test_passed_data_in_header(): void{
        $result = false;
        $data = ['name'=>'Named','otherInfo'=>'info'];
        Http::fake(function(Request $req) use (&$result,$data) {
            $result = $req->hasHeaders($data);
            return Http::response();
        });
        $req = new HttpRequestMode([
            'u'=>'https://test.com',
            'd'=>'header'
        ]);
        $this->assertTrue($req->send($data),"Failed sending data");
        $this->assertTrue($result,"passed headers don't have \$data keys");
    }
    public function test_passed_data_in_query(): void{
        $result = false;
        $data = ['name'=>'Named','otherInfo'=>'info'];
        Http::fake(function(Request $req) use (&$result) {
            $url =$req->url();
            $pos = strpos($url,'?');
            if(gettype($pos) == 'bool'){
                $result = false;
            };
            $str = substr($url,$pos + 1);
            parse_str($str,$result);
            return Http::response();
        });
        $req = new HttpRequestMode([
            'u'=>'https://test.com',
            'd'=>'query'
        ]);
        $this->assertTrue($req->send($data),"Failed sending data");
        $this->assertNotFalse($result,"Data not passed to query");
        $this->assertEqualsCanonicalizing($data,$result,"Returned query not is equal to data passed");
    }
    #[DataProvider('validationProvider')]
    public function test_data_validator(array $data,bool $expected){
        $result = [];
        $res = HttpRequestMode::isDataValid($data,$result);
        $this->assertEquals($expected,$res,"invalid assert returned:".json_encode($result));
    }
    public function test_return_false_case_address_not_reachable(){
        Http::fake(function(Request $req){
            //Don't return any response
        });
        $req = new HttpRequestMode([
            'u'=>'https://test.com',
            'd'=>'query'
        ]);
        $this->assertFalse($req->send([]));
    }
}
