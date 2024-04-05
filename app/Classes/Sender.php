<?php

namespace App\Classes;
/** Contains all locations to send some determined event */
class Sender{
    /**
     * @param \App\Classes\LocationBuilder[] $locations
     * @param \App\Classes\LocationBuilder[] $fallbacks locations to active case one base location not is working
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