<?php
namespace App\Http\Controllers;

class Checker{
    private $checkers = [];
    private $nonRequired = [];
    public function __construct(private array $checkIn){
    }
    public function optional($prop){
        $this->nonRequired[] = $prop;
        return $this;
    }
    public function checkType($propName,$expected){
        if(!isset($this->checkers[$propName]))
            $this->checkers[$propName] = ['type'=>null,'custom'=>null];
        $this->checkers[$propName]['type'] = $expected;
        return $this;
    }
    public function getProperties(){
        return array_keys($this->checkers);
    }
    public function check($propName,$func){
        if(!isset($this->checkers[$propName]))
            $this->checkers[$propName] = ['type'=>null,'custom'=>null];
        $this->checkers[$propName]['custom'] = $func;
        return $this;
    }
    public function execute($props = ['*']){
        $keys = [];
        if(count($props) == 0){
            return null;
        };
        if($props[0] === '*'){
            $keys = array_keys($this->checkers);
        }else{
            $keys = $props;
        };
        foreach ($keys as $key) {
            if(!isset($this->checkers[$key])){
                continue;
            }
            if(!isset($this->checkIn[$key])){
                if(in_array($key,$this->nonRequired)){
                    continue;
                }
                return ['property_not_passed',$key];
            };
            $data = $this->checkers[$key];
            $type = $data['type'];
            $custom = $data['custom'];
            if($type != null){
                $ret =$this->runCheckType($key,$type);
                if($ret != null)
                    return $ret;
            };
            if($custom != null){
                $ret = $this->runCheck($key,$custom);
                if($ret != null){
                    return $ret;
                }
            }
        }
        return null;
    }
    private function runCheck($propName,$func){
        $ret = [];
        $result = $func($this->checkIn[$propName],$ret);
        if(!$result){
            return ['invalid_data',$propName,$ret];
        };
        return null;
    }
    private function runCheckType($propName,$expected){
        $typeProp = gettype($this->checkIn[$propName]);
        if($typeProp != $expected){
            return ['invalid_type',$propName,$expected,$typeProp];
        };
        return null;
    }
}