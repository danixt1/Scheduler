<?php 

namespace App\Classes;

class Stats{
    private $stats = [];
    function __construct(array $names){
        foreach ($names as $name) {
            $this->stats[$name] = 0;
        };
    }
    function set($name,$value){
        $this->stats[$name] = $value;
    }
    function add($name){
        $this->stats[$name]++;
    }
    function result(){
        return $this->stats;
    }
}