<?php

namespace App\Http\DataType;

class DataTypeResource{
    use DataTypeTrait;
    protected static function setValueInInfo(string $methodName, string $name, int $id): mixed{
        return $methodName;
    }
    static protected function calendarEvent_reminder_1($data){
        return [
            'name'=>$data[0],
            'description'=>isset($data[1]) ? $data[1] : ''
        ];
    }
    static protected function location_HttpRequestMode_1($data){
        return $data;
    }
    public static function get(string $dataName,int $type,string $dataStr){
        $data = json_decode($dataStr);
        self::runGet();
        self::verify($dataName,$type);
        return [self::class,self::$methods_info[$dataName][$type]]($data);
    }
}