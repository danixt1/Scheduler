<?php

namespace App\Classes;
use App\Events\Reminder;

abstract class CalendarEventBuilder implements \App\Classes\Builder{
    protected static $list = [];
    abstract function getData():array;
    abstract function getAction():ActionMaker | null;
    abstract function getId():int;
    public static function create(mixed $data, int $type,int $id = -1): CalendarEventBuilder{
        return new self::$list[$type]((array) $data,$id);
    }
    public static function register(string $class, int $id): void{
        self::$list[$id] = $class;
    }
}
CalendarEventBuilder::register(Reminder::class,1);
