<?php

namespace App\Events\Scheduler;

use App\Events\Scheduler\Location\LocationBase;

class Sender{
    private $fallbacks = [];
    private $activatedLocs = [];
    private $fails = [];
    public function __construct(private LocationProcessorDTO $toTrigger, private EventData $ev){}

    public function buildLocation(int $type, bool $isfallback, string $data){
        $onFailure = function(ProcessResult $result){
            $this->fails[] = $result->getError();
        };
        $loc = LocationBase::create($type, $isfallback, $data,$this->ev,$onFailure);
        if (!$isfallback) {
            $this->activatedLocs[] = $loc;
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