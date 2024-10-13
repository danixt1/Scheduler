<?php

namespace App\Events\Scheduler;

class LocationProcessorDTO{
    private $locs = [];
    public function add($location){
        if(is_array($location)){
            $this->locs = array_merge($this->locs,$location);
            return;
        }
        $this->locs[] = $location;
    }
    public function getLocations(){
        return $this->locs;
    }
    public function clear(){
        $this->locs = [];
    }
}
