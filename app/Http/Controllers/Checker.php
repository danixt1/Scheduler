<?php
namespace App\Http\Controllers;

use Illuminate\Http\Response;

class Checker{
    use ApiTrait;
    private $response = null;
    public function __construct(private array $checkIn){
    }
    public function checkType($propName,$expected){
        if($this->response){
            return $this->response;
        }
        if(!isset($this->checkIn[$propName])){
            $this->response = $this->response_property_not_passed($propName);
            return $this->response;
        };
        $typeProp = gettype($this->checkIn[$propName]);
        if($typeProp != $expected){
            $this->response = $this->response_invalid_type($propName,$expected,$typeProp);
            return $this->response;
        };
        return true;
    }
    public function check($propName,$func){
        if($this->response){
            return $this->response;
        }
        $ret = [];
        $result = $func($this->checkIn[$propName],$ret);
        if(!$result){
            $this->response = $this->response_invalid_data($propName,$ret);
            return $this->response;
        };
        return true;
    }
    public function finish(){
        return $this->response ? $this->response :  null;
    }
}