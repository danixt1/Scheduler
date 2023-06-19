<?php

namespace App\Classes;
use App\Events\Reminder;
use Exception;

abstract class CalendarEventGetter{
    private static $list = [];
    static function register(string $class,int $id){
        self::$list[$id] = $class;
    }
    static function create(mixed $data,int $type):CalendarEventGetter{
        if(!isset(self::$list[$type])){
            throw new Exception("Invalid type, type with value ".$type ." not exist");
        }
        return new self::$list[$type]($data);
    }
    abstract function getData():array;
    abstract function action():array;
}
CalendarEventGetter::register(Reminder::class,1);
