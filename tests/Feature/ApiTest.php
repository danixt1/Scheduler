<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\LocSender;
use App\Models\Sender;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Depends;
use Tests\TestCase;

use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertEqualsCanonicalizing;
use function PHPUnit\Framework\assertIsObject;
use function PHPUnit\Framework\assertNull;

class ApiTest extends TestCase{
    protected static $order = [
        ['locsender',LocSender::class],
        ['sender',Sender::class],
        ['location',Location::class]
    ];
    protected static $updaters = [
        ['isFallback'=>True],
        ['name'=>'updater test'],
        ['data'=>['u'=>'http://otherTest.com','m'=>'GET'],'type'=>1]
    ];
    protected static $getters = [
        ['id','isFallback','location_id','sender_id'],
        ['name','id'],
        ['id','name','data','type']
    ];
    //Expected successful creation
    protected static $creaters = [
        [
            ['isFallback'=>False,'location_id'=>2,'sender_id'=>2],
            ['location_id'=>3,'sender_id'=>3]
        ],
        [
            ['name'=>'test_name']
        ],
        [
            ['name'=>'test new loc','data'=>['u'=>'http://test.test','m'=>'GET'],'type'=>1],
            ['name'=>'second test','data'=>['u'=>'http://test2.test'],'type'=>1]
        ]
    ];
    public static function update_provider(){
        $base = self::$order;
        $updaters = self::$updaters;
        $ret = [];
        foreach ($base as $key => $value) {
            $ret[] = [$value[0],$value[1],$updaters[$key]];
        }
        return $ret;
    }
    public static function base_provider(){
        //Pass the name(In api route) and class from the test
        return self::$order;
    }
    public static function create_provider(){
        $creaters = self::$creaters;
        $basic = self::base_provider();
        $ret = [];
        foreach ($creaters as $key => $value) {
            $ret[] = [$basic[$key][0],$basic[$key][1],$value];
        };
        return $ret;
    }
    public static function getter_provider(){
        //pass the expected collums to return
        $getters = self::$getters;
        $finish = [];
        $base = self::base_provider();
        foreach ($getters as $key => $value) {
            $finish[] = [$base[$key][0],$value,$base[$key][1]];
        };
        return $finish;
    }
    public function test_make_db(): void{
        $this->assertEquals(0,Artisan::call('migrate:fresh'),Artisan::output());
        $this->assertEquals(0,Artisan::call('db:seed'),Artisan::output());
    }
    #[Depends('test_make_db')]
    #[DataProvider('getter_provider')]
    public function test_getters(string $name,array $collums,string $class): void{
        $response = $this->get("/api/$name");
        $data = $class::all($collums);
        $props = array_keys($response->json()[0]);
        $response->assertStatus(200);
        $response->assertJson(function() use ($data){
            return $data;
        },True);
        assertEqualsCanonicalizing($collums,$props);
    }
    #[Depends('test_make_db')]
    #[DataProvider('base_provider')]
    public function test_delete(string $name,string $class){
        $expect = $class::find(1);
        assertIsObject($expect,"Failed getting item with id 1 in $name, check if seed is correct defined or if is deleted for cascade delete");
        $resp = $this->delete("/api/$name/1");
        $resp->assertStatus(204);
        assertNull($class::find(1));
    }
    #[Depends('test_make_db')]
    #[DataProvider('create_provider')]
    public function test_create(string $name,string $class,array $data){
        foreach ($data as $value) {
            $resp = $this->postJson("/api/$name",$value);
            $resp->assertStatus(204);
        }
        $inDb = $class::query()->latest()->limit(count($data))->get();
        foreach ($data as $prop => $value) { 
            $dbRow = $inDb[$prop];
            foreach ($value as $key => $propValue) {
                if(gettype($propValue) == 'array'){
                    $value[$key] = json_encode($propValue);
                }
            }

            $fromDb =array_filter(
                $dbRow->toArray(),
                fn($key) =>array_key_exists($key,$value),
                ARRAY_FILTER_USE_KEY
            );
            assertEquals($fromDb,$value);
        }
    }
    #[Depends('test_make_db')]
    #[DataProvider('update_provider')]
    public function test_update(string $name,string $class,array $update){
        $res = $this->post("/api/$name/3",$update);
        $res->assertStatus(204);

    }
}
