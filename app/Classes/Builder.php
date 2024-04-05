<?php
namespace App\Classes;

//TODO make new system to builder
/**
 * Attention system remake is necessary builder is too diferent from childs, is necessary to padronize childs generated from builders
 */
interface Builder{
    public static function validate(array $data,int $type,array &$ret = null):bool;
    public static function create(mixed $data,int $type):Builder;
    public static function register(string $class,int $id):void;
    public static function exist($type):bool;
}