<?php
namespace App\Classes;

use Exception;

interface Builder{
    public static function create(mixed $data,int $type):Builder;
    public static function register(string $class,int $id):void;
    public static function exist($type):bool;
}