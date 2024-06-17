<?php
namespace App\Events\Scheduler;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DbBulk{
    private $toInsert = [];
    private $toDelete = [];

    public function insert(string $table,$data){
        $this->addTo($this->toInsert,$table,$data);
    }
    public function delete(string $table,int $id){
        $this->addTo($this->toDelete,$table,$id);
    }
    public function execute(){
        DB::beginTransaction();
        try{
            foreach ($this->toDelete as $table => $value) {
                DB::table($table)->whereIn('id',$value)->delete();
            }
            foreach($this->toInsert as $table =>$data){
                DB::table($table)->insert($data);
            }
            DB::commit();
        }catch(\Illuminate\Database\QueryException $e){
            DB::rollBack();
            Log::critical('Failed executing query',
            [
                "in"=>"Events\\Scheduler\\DbBulk",
                "query"=>$e->getSql(),
                "code"=>$e->getCode(),
                "msg"=>$e->getMessage()
            ]);
            return false;
        };
        return true;
    }
    private function addTo(&$array,$index,$value){
        if(!isset($array[$index])){
            $array[$index] = [];
        }
        $array[$index][] = $value;
    }
}