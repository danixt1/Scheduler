<?php

namespace App\Http\Controllers;

use App\Http\Resources\SenderResource;
use App\Models\Sender;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
//TODO definir padrão para retornar um model no data_all e passar o senderResource na coleção
class SenderController extends ApiController{
    use GetDataInModel;
    protected string $model = Sender::class;
    public function __construct(){
        parent::__construct(['name','ids'],SenderResource::class);
    }
    static public function name(): string{
        return "Sender";
    }
    public static function toDb(array $data): array{
        return $data;
    }
    protected function data_update(string $id,array $dataToSet):int{
        if(isset($dataToSet['ids'])){
            DB::transaction(function() use($dataToSet,$id){
                $values = $dataToSet['ids'];
                DB::table('locsenders')->where('sender_id',$id)->delete();
                if(count($values) != 0){
                    $inserter = [];
                    foreach ($values as $value) {
                        $inserter[] = ['sender_id'=>$id,'location_id'=>$value,'isFallback'=>False];
                    }
                    DB::table('locsenders')->insert($inserter);
                }
            });
        }
        return $this->model::where('id',$id)->update(['name'=>$dataToSet['name']]);
    }
    protected function data_create(array $data):int{
        $retId = -1;
        DB::transaction(function() use(&$retId,$data){
            try {
                $values = $data['ids'];
                $info =$this->model::create(["name"=>$data['name']]);
                $retId = $info->id;
                if(count($values) != 0){
                    $inserter = [];
                    foreach ($values as $value) {
                        $inserter[] = ['sender_id'=>$info->id,'location_id'=>$value,'isFallback'=>False];
                    }
                    DB::table('locsenders')->insert($inserter);
                }
            } catch (\Throwable $th) {
                $retId = $th;
                throw $th;
            }
        });
        if(gettype($retId) != 'integer'){
            throw $retId;
        }
        return $retId;
    }
    protected function makeChecker(array &$data): Checker{
        $checker = new Checker($data);
        $checker->
            checkType('name','string')->
            checkType('ids','array')->
            check('name',function($val){
                return strlen($val) > 2;
            })->
            check('ids',function($val,&$ret){
                $len = count($val);
                if($len == 0){
                    return true;
                };
                if($len > 4){
                    $ret = [
                        'message'=>'Limit of locations reachead to sender',
                        'error'=>'max_ids_reached'
                    ];
                    return false;
                }
                foreach ($val as $key => $value) {
                    $type = gettype($value);
                    if($type != 'integer'){
                        $ret = [
                            'message'=>"Value in position $key not is integer, only integer is valid",
                            'expected'=>"[$key] = integer",
                            'passed'=> "[$key] = $type"
                        ];
                        return false;
                    }
                };
                $idsInDb = DB::table('locations')->whereIn('id',$val)->get(['id']);
                if($idsInDb->count() != $len){
                    $ret = [
                        'message'=>"not all ids is valid"
                    ];
                    return false;
                }
                return true;
            });
        return $checker;
    }
}