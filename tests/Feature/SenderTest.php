<?php

namespace Tests\Feature;

use App\Classes\Sender;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\Depends;
use Tests\TestCase;

class SenderTest extends TestCase{
    protected static Sender $sender;
    protected static $urls = ['https://test1.loc','https://test2.loc','https://falltest1.fal','https://falltest2.fal'];

    public function test_construct_sender(): void{
        $urls = self::$urls;
        $sender = [
            'locations'=>[
                ['type'=>1,'data'=>['u'=>$urls[0],'d'=>'json']],
                ['type'=>1,'data'=>['u'=>$urls[1],'d'=>'json']]
            ],
            'fallbacks'=>[
                ['type'=>1,'data'=>['u'=>$urls[2],'d'=>'json']],
                ['type'=>1,'data'=>['u'=>$urls[3],'d'=>'json']]
            ],
            'name'=>'Test Sender'
        ];
        self::$sender = new Sender($sender);
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
        $sender = new Sender([
            'locations'=>[['type'=>1,'data'=>['u'=>2321]]],
            'fallbacks'=>[],
            'name'=>'not throw'
        ]);
        $sender->sendData([]);
        $this->assertTrue(true);
    }
}