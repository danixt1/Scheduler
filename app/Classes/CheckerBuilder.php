<?php

namespace App\Classes;

trait CheckerBuilder{
    protected static function check($checker,$data):array{
        foreach($checker as $name =>$check){
            if(!isset($data[$name])){
                if(isset($check['required']) && $check['required']){
                    return array('required',$name);
                }else{
                    continue;
                }
            };
            $prop = $data[$name];
            if(isset($check['type']) != gettype($prop)){
                return array('type',$name);
            };
            if(isset($check['equal']) && !in_array($prop,$check['equal'])){
                return array('equal',$name);
            };
            if(isset($check['pattern'])){
                if(!preg_match($check['pattern'],$prop)){
                    return array('pattern',$name);
                }
            };
        }
        return ['passed'];
    }
}