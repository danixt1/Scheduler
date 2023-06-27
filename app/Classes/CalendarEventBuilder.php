<?php

namespace App\Classes;
use App\Events\Reminder;

abstract class CalendarEventBuilder implements \App\Classes\Builder{
    protected static $list = [];
    abstract function getData():array;
    abstract function action():array | null;
    public static function create(mixed $data, int $type): CalendarEventBuilder{
        return new self::$list[$type]($data);
    }
    public static function register(string $class, int $id): void{
        self::$list[$id] = $class;
    }
}
CalendarEventBuilder::register(Reminder::class,1);
