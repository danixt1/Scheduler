<?php

namespace App\Http\DataType;

abstract class DataTypeBase{
    static protected $methods_info = null;
    abstract protected static function setValueInInfo(string $methodName,string $name,int $id):mixed;
    protected static function verify($dataName,$type){
        if(!isset(self::$methods_info[$dataName])){
            throw new \Error($dataName . ' Not Found');
        }
        if(!isset(self::$methods_info[$dataName][$type])){
            throw new ExceptionTypeNotFound($dataName,$type);
        }
    }
    protected static function runGet(){
        if(self::$methods_info){
            return;
        }
        self::$methods_info = [];
        $methods = get_class_methods(get_called_class());
        foreach($methods as $methodName){
            $props = explode('_',$methodName);
            if(count($props) != 3){
                continue;
            }
            [$name,,$id] = $props;
            if(!isset(self::$methods_info[$name])){
                self::$methods_info[$name] = [];
            }
            self::$methods_info[$name][intval($id)] = static::setValueInInfo($methodName,$name,intval($id));
        }
    }
}