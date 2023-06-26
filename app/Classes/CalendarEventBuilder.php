<?php

namespace App\Classes;
use App\Events\Reminder;

abstract class CalendarEventBuilder extends \App\Classes\Builder{
    abstract function getData():array;
    abstract function action():array;
    public static function create(mixed $data, int $type): CalendarEventBuilder{
        return self::instantiate($data,$type);
    }
}
CalendarEventBuilder::register(Reminder::class,1);
