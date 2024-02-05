<?php
namespace App\Http\Controllers;

class Checker{
    use ApiTrait;
    private $checkers = [];
    private $builders = [];
    public function __construct(private array $checkIn){
    }
    public function checkType($propName,$expected){
        if(!isset($this->checkers[$propName]))
            $this->checkers[$propName] = ['type'=>null,'custom'=>null];
        $this->checkers[$propName]['type'] = $expected;
        return $this;
    }
    /**
     * Add a function to rebuild the specified property to put in db.
     * @param string $prop the property to change the bas value
     * @param callable $func returned value from function is passed to db
     */
    public function addBuilder($prop, $func){
        $this->builders[$prop] = $func;
        return $this;
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
            return $this->response_invalid_data($propName,$ret);
        };
        return null;
    }
    private function runCheckType($propName,$expected){
        if(!isset($this->checkIn[$propName])){
            return $this->response_property_not_passed($propName);
        };
        $typeProp = gettype($this->checkIn[$propName]);
        if($typeProp != $expected){
            return $this->response_invalid_type($propName,$expected,$typeProp);
        };
        return null;
    }
    public function getArray():array{
        $passed = $this->checkIn;
        $build = $this->builders;
        $ret = [];
        foreach ($passed as $key => $value) {
           $ret[$key] = isset($build[$key]) ? $build[$key]($value) : $value;
        };
        return $ret;
    }
}