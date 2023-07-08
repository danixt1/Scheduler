<?php

namespace App\Classes;
use App\Locations\HttpRequestMode;

abstract class LocationBuilder implements \App\Classes\Builder{
    protected static $list = [];
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
    public static function locationValidator(array $data,int $type,array &$ret = null):bool{
        return self::$list[$type]::isDataValid($data,$ret);
    }
    public static function create(mixed $data, int $type): LocationBuilder{
        return new self::$list[$type]((array)$data);
    }
    public static function register(string $class, int $id): void{
        self::$list[$id] = $class;
    }
}

LocationBuilder::register(HttpRequestMode::class,1);