<?php

namespace App\Classes;
use App\Processors\Reminder;

abstract class DataGetter{
    private static $list = [];
    static function register(string $class,int $id){
        self::$list[$id] = $class;
    }
    static function create(mixed $data,int $type):DataGetter{
        return new self::$list[$type]($data);
    }
    abstract function getData():array;
    abstract function action():array;
}
DataGetter::register(Reminder::class,1);
?>