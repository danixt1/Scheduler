<?php

namespace App\Classes;
use App\Locations\HttpRequestMode;

abstract class LocationBuilder implements \App\Classes\Builder{
    
    use CheckerBuilder;
    public static function passToDb(array $data,$type):string{
        return self::$list[$type]::toDb($data);
    }
    /** Convert data passed from API, to db format */
    abstract public static function toDb(array $data):string;
    protected static $list = [];
    abstract static function isDataValid(array $data,array &$arr = null):bool;
    abstract public function send(array $data):bool;
    public static function validate(array $data,int $type,array &$ret = null):bool{
        return self::$list[$type]::isDataValid($data,$ret);
    }
    public static function create(mixed $data, int $type): LocationBuilder{
        return new self::$list[$type]((array)$data);
    }
    public static function register(string $class, int $id): void{
        self::$list[$id] = $class;
    }
    public static function exist($type): bool{
        return isset(self::$list[$type]);
    }
}

LocationBuilder::register(HttpRequestMode::class,1);