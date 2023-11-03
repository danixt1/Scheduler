<?php

namespace App\Http\Controllers;

use App\Classes\LocationBuilder;
use App\Http\Resources\LocationResource;
use App\Models\Location;

class LocationController extends ApiController{
    use GetDataInModel;
    protected string $model = Location::class;
    public function __construct(){
        parent::__construct(['name','data','type'],LocationResource::class);
    }
    protected function makeChecker(array &$data):Checker{
        $checker = new Checker($data);

        $checker->
            checkType('name','string')->
            checkType('data','array')->
            checkType('type','integer')->

            check('name',fn ($val)=>strlen($val) > 3)->
            check('type',fn ($val)=>LocationBuilder::exist($val))->
            check('data',function ($val,&$ret) use ($data){
                if(!isset($data['type'])){
                    return false;
                }
                $err = [];
                $res = LocationBuilder::validate($val,$data['type'],$err);
                if(!$res){
                    $ret[$err[0]] = $err[1];
                };
                return $res;
            })->
            addBuilder('data',fn($val)=>LocationBuilder::passToDb($val,$data['type']));
        
        return $checker;
    }
}
