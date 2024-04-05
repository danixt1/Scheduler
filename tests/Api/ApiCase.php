<?php

namespace Tests\Api;

use Error;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

abstract Class ApiCase extends TestCase{
    use RefreshDatabase;

    abstract function apiCreate():array;
    /** Return the models created in db to check if is in list */
    abstract function apiRead():array;
    abstract function apiUpdate():array;
    abstract function apiDelete():Model;

    abstract function model():string;
    abstract function apiName():string;
    function test_get_one(){
        $this->refreshTestDatabase();
        $model = $this->getOneModel($this->apiRead());
        $entrypoint = $this->apiName();
        $path = $entrypoint.'/'. $model->id;
        Log::info("///////// TEST GET in ". $path ." /////////");
        $resp = $this->get("api/v1/$path");
        $resp->assertOk();
        $json = $resp->json();
        Log::info('returned json',$json);
        Log::info("---------------END TEST GET---------------");
    }
    function test_get_one_not_found_case(){
        $this->refreshTestDatabase();
        $entrypoint = $this->apiName();
        $path = $entrypoint.'/'. '5412512815';
        Log::info("///////// TEST GET NOT_FOUND in ". $path ." /////////");
        $resp = $this->get("api/v1/$path");
        $resp->assertNotFound();
        $json = $resp->json();
        Log::info('returned json',$json);
        Log::info("---------------END TEST GET NOT_FOUND---------------");
    }
    function test_get_one_with_cache(){
        $this->refreshTestDatabase();
        $model = $this->getOneModel($this->apiRead());
        $entrypoint = $this->apiName();
        $path = $entrypoint.'/'. $model->id;
        Log::info("///////// TEST GET CACHED in ". $path ." /////////");
        $resp = $this->get("api/v1/$path");
        $cached = $this->get("api/v1/$path");
        $resp->assertOk();
        $cached->assertOk();
        $this->assertEqualsCanonicalizing($resp->json(),$cached->json(),"nNot returning the same value from cache");
        Log::info("---------------END TEST GET CACHED ---------------");
        
    }
    private function getOneModel($models){
        $first = $models[0];
        if($first instanceof Collection){
            return $first[0];
        }else{
            return $first;
        }
    }
    function test_create(){
        $this->refreshTestDatabase();
        $info = $this->apiCreate();

        $model = $this->model();
        $entrypoint = $this->apiName();
        $tableName = app($model)->getTable();

        $totalItemCreated = 0;
        $count = 0;
        Log::info("///////// TEST CREATE in $entrypoint /////////");
        foreach ($info as &$create) {
            $count++;
            Log::info("ITEM $count");
            $expect = $create['expected'];
            $toSend = $create['send'];
            Log::info("sended",$toSend);
            $response =  $this->post("api/v1/$entrypoint",$toSend);
            $this->isExpected($response,$expect);
            $expectResp = gettype($expect) == 'array'? $expect[0] : $expect;
            if($expectResp === 'CREATED'){
                //stringfy arrays in "toSend"
                foreach ($toSend as $key => $value) {
                    if(gettype($value) === 'array'){
                        $toSend[$key] = json_encode($value);
                    }
                }
                $inDb = isset($create['inDb']) ? $create['inDb'] : $toSend;
                $this->assertDatabaseHas($tableName,$inDb);
                $totalItemCreated++;
            }
        }
        if($totalItemCreated == 0){
            throw new Error('On create phase is expected at last one item to be created, 
            to be checked if is correct added to database');
        }
        Log::info("---------------END TEST CREATE---------------");
    }
    function test_read(){
        $this->refreshTestDatabase();
        $models = $this->apiRead();

        $entrypoint = $this->apiName();
        $getters = [];
        Log::info("///////// TEST READ in $entrypoint /////////");
        foreach ($models as $actModel) {
            $data = $actModel;
            if($data instanceof Collection){
                foreach($data as $act){
                    $getters[] = $act->id;
                }
            }else{
                $getters[] = $data->id;
            }
        };
        $resp = $this->get("/api/v1/$entrypoint");
        $resp->assertOk();
        $json = $resp->json();
        Log::info('returned json',$json);
        $this->assertEquals(count($getters),count($json['data']));
        foreach($json['data'] as $val){
           $this->assertTrue(in_array($val['id'],$getters));
        }
        Log::info("---------------END TEST READ---------------");

    }
    function test_update(){
        $this->refreshTestDatabase();
        $data = $this->apiUpdate();
        $model = $this->model();
        $entrypoint = $this->apiName();
        Log::info("/////////  TEST UPDATE in $entrypoint /////////");
        foreach($data as $act){
            $model = $act['model'];
            $send = $act['send'];
            $expected = $act['expected'];
            Log::info("ITEM $entrypoint/".$model->id);
            $resp = $this->post("/api/v1/$entrypoint/".$model->id,$send);
            $this->isExpected($resp,$expected);
            Log::info("----END----");
        };
        Log::info("---------------END TEST UPDATE---------------");
    }
    function test_delete(){
        $this->refreshTestDatabase();
        $entrypoint = $this->apiName();
        $model = $this->apiDelete();
        $this->delete("/api/v1/$entrypoint/".$model->id);
        Log::info("///////// TEST DELETE in $entrypoint/".$model->id." /////////");
        $this->assertModelMissing($model);
        Log::info("---------------END---------------");
    }
    private function isExpected(\Illuminate\Testing\TestResponse $resp,array | string $data){
        $message = 'OK';
        $check = null;
        if(gettype($data) == 'string'){
            $message = $data;
        }else{
            $message = $data[0];
            if(isset($data[1])){
                $check = $data[1];
            }
        };
        $message = strtoupper($message);
        try {
            //Some responses does not  have body
            Log::info("Response",["body"=> $resp->json(),"code"=>$resp->baseResponse->getStatusCode()]);
        } catch (\Throwable $th) {
            Log::info("Response with no body!");
        }
        switch ($message) {
            case 'CREATED':
                $resp->assertCreated();
                break;
            case 'OK':
                $resp->assertOk();
                break;
            case 'BAD_REQUEST':
                $resp->assertBadRequest();
                break;
            case 'NO_CONTENT':
                $resp->assertNoContent();
                break;
            default:
                throw new Error("Invalid message, message: $message not is valid");
        }
        if($check != null){
            $resp->assertJson($check);
        }
    }
}