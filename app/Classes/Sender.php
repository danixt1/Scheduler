<?php

namespace App\Classes;

class Sender{
    /**
     * @param \App\Classes\LocationBuilder[] $locations
     * @param \App\Classes\LocationBuilder[] $fallbacks
     */
    public function __construct(private string $name,private array $locations,private array $fallbacks = []){}
    public function sendData(array $dataToSend){
        $dataToSend = array_merge($dataToSend,['sender'=>$this->name,'isFallback'=>false]);
        foreach($this->locations as $location){
            $res = $location->send($dataToSend);
            if(!$res){
                $this->callFallbacks($dataToSend);
            }
        }
    }
    private function callFallbacks(array $dataToSend){
        $dataToSend['isFallback'] = true;
        foreach($this->fallbacks as $fallback){
            $fallback->send($dataToSend);
        }
    }
}
?>