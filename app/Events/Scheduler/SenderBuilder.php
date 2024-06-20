<?php

namespace App\Events\Scheduler;

class SenderBuilder{
    private LocationProcessorDTO $dto;
    private $senders = [];
    public function __construct(){
        $this->dto = new LocationProcessorDTO;
    }
    public function buildSender(EventData $ev,?int $id = null):Sender{
        if($id != null && isset($this->senders[$id])){
            return $this->senders[$id];
        }
        $sender = new Sender($this->dto,$ev);
        if($id != null){
            $this->senders[$id] = $sender;
        }
        return $sender;
    }
    public function fireAllLocations(){
        $locs = $this->dto->getLocations();
        $this->dto->clear();
        $promises = [];
        $nonAsync = [];

        foreach ($locs as $loc) {
            if($loc->isAsync()){
                $promises[] = $loc->run();
                continue;
            }
            $nonAsync[] = $loc;
        };
        \GuzzleHttp\Promise\Utils::settle($promises)->wait();
        foreach($nonAsync as $runner){
            $runner->run();
        }
        foreach($this->senders as $sender){
            $sender->afterProcessEnd();
        }
        if(count($this->dto->getLocations()) > 0){
            $this->fireAllLocations();
        }
    }
}