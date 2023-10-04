<?php

namespace App\Classes;
use App\Events\Reminder;

abstract class CalendarEventBuilder implements \App\Classes\Builder{
    use CheckerBuilder;
    protected static $list = [];

    abstract function getData():array;
    abstract function getAction():ActionMaker | null;
    abstract function getId():int;
    public static function passToDb(array $data,$type):string{
        return self::$list[$type]::toDb($data);
    }
    abstract static function isDataValid(array $data,array &$arr = null):bool;
    /**Name used in front end */
    abstract function getName():string;
    public static function validate(array $data, int $type, ?array &$ret = null): bool{
        return self::$list[$type]::isDataValid($data,$ret);
    }
    public static function create(mixed $data, int $type,int $id = -1): CalendarEventBuilder{
        return new self::$list[$type]((array) $data,$id);
    }
    public static function register(string $class, int $id): void{
        self::$list[$id] = $class;
    }
    public static function exist($type): bool
    {
        return isset(self::$list[$type]);
    }
}
CalendarEventBuilder::register(Reminder::class,1);
