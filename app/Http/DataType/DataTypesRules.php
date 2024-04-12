<?php

namespace App\Http\DataType;

use Error;
use Illuminate\Validation\Rule;

class DataTypesRules{
    static private $methods_info = null;

    static protected function location_HttpRequestMode_1(){
        return [
            'data.u'=>'required|url:http,https',
            'data.m'=>[Rule::in(['GET','POST','DELETE','UPDATE'])],
            'data.h'=>'array',
            'data.d'=>[Rule::in(['default','header','query','json'])]
        ];
    }
    static protected function calendarEvent_reminder_1(){
        return [
            'data.name'=>'required|string',
            'data.description'=>'string|nullable'
        ];
    }
    public static function get(string $dataName,int $type){
        if(!self::$methods_info){
            self::$methods_info = [];
            $methods = get_class_methods(self::class);
            foreach($methods as $methodName){
                $props = explode('_',$methodName);
                if(count($props) != 3){
                    continue;
                }
                [$name,,$id] = $props;
                if(!isset(self::$methods_info[$name])){
                    self::$methods_info[$name] = [];
                }
                self::$methods_info[$name][intval($id)] = [self::class,$methodName]();
            }
        }
        if(!isset(self::$methods_info[$dataName])){
            throw new Error("$dataName not exist");
        }
        if(!isset(self::$methods_info[$dataName][$type])){
            throw new Error("type $type from $dataName not exist");
        }
        return self::$methods_info[$dataName][$type];
    }
}