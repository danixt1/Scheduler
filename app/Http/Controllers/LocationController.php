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
    protected function checkerCreate(array &$data): null|JsonResponse{
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
            $err = [];
            $res = LocationBuilder::locationValidator($val,$data['type'],$err);
            if(!$res){
                $ret[$err[0]] = $err[1];
            };
            return $res;
        });
        $result = $checker->finish();
        if(!$result){
            $data['data'] = json_encode($data['data']);
            return null;
        };
        return $result;
    }
}
