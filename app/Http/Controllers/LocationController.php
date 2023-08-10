<?php

namespace App\Http\Controllers;

use App\Classes\LocationBuilder;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LocationController extends ApiController{
    public function __construct()
    {
        parent::__construct(Location::class,['name','data','type'],['id','name','data','type']);
    }
    protected function makeChecker(array &$data):Checker{
        $checker = new Checker($data);

        $checker->checkType('name','string');
        $checker->checkType('data','array');
        $checker->checkType('type','integer');

        $checker->check('name',function ($val){
            return strlen($val) > 3;
        });
        $checker->check('type',function ($val){
            return LocationBuilder::exist($val);
        });
        $checker->check('data',function ($val,&$ret) use ($data){
            if(!isset($data['type'])){
                return false;
            }
            $err = [];
            $res = LocationBuilder::locationValidator($val,$data['type'],$err);
            if(!$res){
                $ret[$err[0]] = $err[1];
            };
            return $res;
        });
        $checker->addBuilder('data',function($val){
            return json_encode($val);
        });
        return $checker;
    }
}
