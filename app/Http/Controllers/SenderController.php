<?php

namespace App\Http\Controllers;

use App\Http\Resources\SenderResource;
use App\Models\Sender;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

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
    public static function toDb(): DbResolver{
        $resolver = new DbResolver;
        return $resolver;
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
    protected function beforeValidation($userData, string $ctx)
    {
        if(!isset($userData['ids'])){
            $userData['ids'] = [];
        };
        return $userData;
    }
    protected function makeChecker($ctx): Validator{
        $rules = [
            'name'=>'required|string|min:3',
            'ids'=>['bail','array','max:4',
                function (string $attribute, mixed $value, Closure $fail){
                    foreach ($value as $id) {
                        if(!is_integer($id)){
                            $fail("not all $attribute are integer");
                        }
                    }
                }
            ]
        ];
        
        return $this->validator($rules);
    }
}