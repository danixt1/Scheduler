<?php

namespace Tests\Feature;

use App\Classes\ActionProcessor as act;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Depends;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ActionProcessorTestDB extends TestCase{
    public static act $act;
    public static array $ref = ["event"=>"eventsdatas","trigger"=>"timeevents"];

    public static function delProvider():array{
        $t = [1,2,4,7,8];
        $e = [1,2,8];
        $ret = [];
        foreach($t as $local){
            $ret[] = ["trigger",$local];
        };
        foreach($e as $local){
            $ret[] = ["event",$local];
        };
        return $ret;
    }

    public static function updProvider():array{
        return [
            ['trigger',3,['date'=>'2000-01-01 10:00:00']],
            ['event',3,['data'=>'test']]
        ];
    }

    public function test_build_actionProcessor(){
        self::$act = new act(self::$ref);
        $this->assertTrue(true);
    }
    #[Depends('test_build_actionProcessor')]
    public function test_prepare_db(){
        $this->assertEquals(0,Artisan::call('migrate:fresh'),Artisan::output());
        $this->assertEquals(0,Artisan::call('db:seed'),Artisan::output());
    }
    #[Depends('test_prepare_db')]
    public function test_add_delete_actions(){
        $act = self::$act;
        foreach(self::delProvider() as $del){
            [$name,$id] = $del;
            $act->action([
                "action"=>"delete",
                "target"=>$name
            ],[$name => $id]);
        };
        $this->assertTrue(true);
    }

    #[Depends('test_prepare_db')]
    public function test_add_update_actions(){
        $act = self::$act;
        foreach(self::updProvider() as $upd){
            [$relativeName,$id,$data] = $upd;
            $act->action([
                'action'=>'update',
                'target'=>$relativeName,
                'data'=>$data
            ],[$relativeName=>$id]);
        };
        $this->assertTrue(true);
    }

    #[Depends('test_add_delete_actions')]
    #[Depends('test_add_update_actions')]
    public function test_call_execute_function(){
        self::$act->execute();
        $this->assertTrue(true);
    }

    #[DataProvider('updProvider')]
    #[Depends('test_call_execute_function')]
    public function test_row_is_updated(string $relativeName,int $id,array $data){
        $tableName = Self::$ref[$relativeName];
        $model = DB::table($tableName)->find($id);
        $this->assertNotNull($model);
        foreach($data as $key=>$value){
            $this->assertEquals($model->{$key},$value);
        };
    }

    #[DataProvider('delProvider')]
    #[Depends('test_call_execute_function')]
    public function test_row_is_deleted_from_db(string $refName,int $id):void{
        $tableName = self::$ref[$refName];
        $res = DB::table($tableName)->find($id);
        $this->assertEquals(null,$res);
    }
}