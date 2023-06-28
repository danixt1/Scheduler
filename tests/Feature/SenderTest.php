<?php

namespace Tests\Feature;

use App\Classes\Sender;
use App\Classes\LocationBuilder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\Depends;
use Tests\TestCase;

class SenderTest extends TestCase{
    protected static Sender $sender;
    protected static $urls = ['https://test1.loc','https://test2.loc','https://falltest1.fal','https://falltest2.fal'];
    protected static function buildLocation($url){
        return LocationBuilder::create(['u'=>$url,'d'=>'json'],1);
    }
    public function test_construct_sender(): void{
        $urls = self::$urls;
        $locations =[
            self::buildLocation($urls[0]),
            self::buildLocation($urls[1])
        ];
        $fallbacks = [
            self::buildLocation($urls[2]),
            self::buildLocation($urls[3])
        ];
        self::$sender = new Sender('Test Sender',$locations,$fallbacks);
        $this->assertTrue(true);
    }
    #[Depends('test_construct_sender')]
    public function test_successful_send_data_to_locations(): void{
        $count = 0;
        $urls = self::$urls;
        Http::fake(function(Request $req) use ($urls,&$count){
            $res = in_array($req->url(),$urls);
            if($res){
                $count++;
            };
            return Http::response();
        });
        self::$sender->sendData([]);
        $this->assertEquals(2,$count,'Not all locations has trigged');
    }
    #[Depends('test_construct_sender')]
    public function test_trigger_one_fallback_one_location():void{
        $receivedFallback = false;
        $receivedLocation = false;

        $fallback = self::$urls[2];
        $location = self::$urls[1];
        http::fake(function(Request $req) use ($fallback,$location,&$receivedFallback,&$receivedLocation){
            switch($req->url()){
                case $location:
                    $receivedLocation = true;
                    return http::response();
                case $fallback:
                    $receivedFallback = true;
                    return http::response();
                default:
                    return http::response(null,403);
            };
        });
        self::$sender->sendData([]);
        $this->assertTrue($receivedLocation,'Location not received');
        $this->assertTrue($receivedFallback,'Fallback not actived');
    }
    public function test_dont_throw_with_invalid_data():void{
        $sender = new Sender('not throw',[self::buildLocation(2332)],[]);
        $sender->sendData([]);
        $this->assertTrue(true);
    }
}