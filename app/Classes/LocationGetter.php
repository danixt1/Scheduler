<?php

namespace App\Classes;
use App\Locations\HttpRequestMode;
abstract class LocationGetter{
    private static $locations = [];
    abstract static function isDataValid(array $data,array &$arr = null):bool;
    abstract public function send(array $data):bool;
    protected static function check($checker,$data):array{
        foreach($checker as $name =>$check){
            if(!isset($data[$name])){
                if(isset($check['required']) && $check['required']){
                    return array('required',$name);
                }else{
                    continue;
                }
            };
            $prop = $data[$name];
            if(isset($check['type']) != gettype($prop)){
                return array('type',$name);
            };
            if(isset($check['equal']) && !in_array($prop,$check['equal'])){
                return array('equal',$name);
            };
            if(isset($check['pattern'])){
                if(!preg_match($check['pattern'],$prop)){
                    return array('pattern',$name);
                }
            };
        }
        return ['passed'];
    }

    public static function register(int $id,string $loc){
        self::$locations[$id] = $loc;
    }
    public static function create(int $id,array $data):LocationGetter{
        return new self::$locations[$id]($data);
    }
}

LocationGetter::register(1,HttpRequestMode::class);