<?php

namespace App\Http\DataType;

use Illuminate\Validation\Rule;

class DataTypesRules extends DataTypeBase{
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

    protected static function setValueInInfo(string $methodName, string $name, int $id): mixed{
        return [self::class,$methodName]();
    }
    public static function get(string $dataName,int $type){
        self::runGet();
        self::verify($dataName,$type);
        return self::$methods_info[$dataName][$type];
    }
}