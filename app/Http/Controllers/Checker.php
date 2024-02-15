<?php
namespace App\Http\Controllers;

class Checker{
    private $checkers = [];
    private $nonRequired = [];
    public function __construct(){
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
    public function execute($test_data,$props = ['*']){
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
            if(!isset($test_data[$key])){
                if(in_array($key,$this->nonRequired)){
                    continue;
                }
                return ['property_not_passed',$key];
            };
            $data = $this->checkers[$key];
            $type = $data['type'];
            $custom = $data['custom'];
            if($type != null){
                $ret =$this->runCheckType($test_data,$key,$type);
                if($ret != null)
                    return $ret;
            };
            if($custom != null){
                $ret = $this->runCheck($test_data,$key,$custom);
                if($ret != null){
                    return $ret;
                }
            }
        }
        return null;
    }
    private function runCheck($data,$propName,$func){
        $ret = [];
        $result = $func($data[$propName],$ret,$data);
        if(!$result){
            return ['invalid_data',$propName,$ret];
        };
        return null;
    }
    private function runCheckType($data,$propName,$expected){
        $typeProp = gettype($data[$propName]);
        if($typeProp != $expected){
            return ['invalid_type',$propName,$expected,$typeProp];
        };
        return null;
    }
}