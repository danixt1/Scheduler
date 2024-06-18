<?php

namespace App\Events\Scheduler;

use App\Events\Scheduler\Location\LocationBase;

class Sender{
    private $fallbacks = [];
    public function __construct(private LocationProcessorDTO $toTrigger, private EventData $ev){}

    public function buildLocation(int $type, bool $isfallback, string $data){
        $loc = LocationBase::create($type, $isfallback, $this, $data);
        if ($isfallback) {
            $this->toTrigger->add($loc);
            return;
        }
        $this->fallbacks[] = $loc;
    }
    public function getEventData(){
        return $this->ev->get();
    }
    public function afterProcessEnd(){
        
    }
}