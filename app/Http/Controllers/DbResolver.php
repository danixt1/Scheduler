<?php
namespace App\Http\Controllers;

use Closure;

/**
 * Modify data from API before saving in DB
 */
class DbResolver{
    private array $toModify = [];
    /**
     * @param string $prop the collum in DB to modify
     * @param Closure $func function with 2 args passed, first arg with the api value from the actual property, second arg with api data. 
     * returned value from this property is the value to add in the actual DB collum specified in `$prop`.
     */
    public function modify(string $prop,Closure $func){
        $this->toModify[$prop] = $func;
        return $this;
    }
    /**
     * Generate DB array from API data calling the functions specifieds in `modify` function
     */
    public function resolve($data){
        $final = [];
        $toModify = $this->toModify;
        foreach($data as $key => $value){
            $final[$key] = isset($toModify[$key]) ? $toModify[$key]($value,$data) : $value;
        }
        return $final;
    }
}