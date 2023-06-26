<?php
namespace App\Classes;

use Exception;

abstract class Builder{
    protected static $list = [];
    abstract static function create(mixed $data,int $type):Builder;
    static function register(string $class,int $id){
        self::$list[$id] = $class;
    }
    protected static function instantiate($data,$type){
        if(!isset(self::$list[$type])){
            throw new Exception("type with id '$type' not exist");
        };
        return new self::$list[$type]($data);
    }
}