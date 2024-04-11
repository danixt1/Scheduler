<?php

namespace App\Http\Controllers;

use App\Classes\LocationBuilder;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class LocationController extends ApiController{
    use GetDataInModel;
    protected string $model = Location::class;
    public function __construct(){
        parent::__construct(['name','data','type'],LocationResource::class);
    }
    static public function name(): string{
        return "Location";
    }
    public static function toDb(): DbResolver{
        $resolver = new DbResolver;
        $resolver->modify('data',function($data,$all){
            return LocationBuilder::passToDb($data,$all['type']);
        });
        return $resolver;
    }
    protected function makeChecker($ctx): Validator{
        $rules = [
            'name'=>'required|string|min:3',
            'data'=>'required|array',
            'type'=>'required|integer|numeric|between:1,1'
        ];
        $validator = $this->validator($rules);
        $data = $validator->getData();
        if(!isset($data['type']) || !is_integer($data['type']) || $data['type'] > 1){
            return $validator;
        }
        if($data['type'] == 1){
            $validator->addRules([
                'data.u'=>'required|url:http,https',
                'data.m'=>[Rule::in(['GET','POST','DELETE','UPDATE'])],
                'data.h'=>'array',
                'data.d'=>[Rule::in(['default','header','query','json'])]
            ]);
        }
        $validator->after(function (Validator $validator) use ($ctx){
            $data = $validator->getData();
            if($ctx == 'update'){
                if(!isset($data['type'])){
                    $validator->errors()->add('type','type is always required in update');
                    return;
                }
            };
        });
        return $validator;
    }
}
