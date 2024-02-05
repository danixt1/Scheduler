<?php
namespace App\Http\Controllers;

class DbResolver{
    private array $toModify = [];
    public function modify(string $prop,$func){
        $this->toModify[$prop] = $func;
        return $this;
    }
    public function resolve($data){
        $final = [];
        $toModify = $this->toModify;
        foreach($data as $key => $value){
            $final[$key] = isset($toModify[$key]) ? $toModify[$key]($value,$data) : $value;
        }
        return $final;
    }
}