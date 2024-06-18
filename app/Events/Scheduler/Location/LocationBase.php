<?php

namespace App\Events\Scheduler\Location;

use App\Events\Scheduler\Sender;

class LocationBase{
    
    protected function __construct(private bool $isFallback,private array $data,private Sender $sender){}
    public function failed(string $reason = ''){

    }
    public static function create(int $type,bool $isFallback,Sender $sender,string $data){

    }
    public function getIsFallback(){
        return $this->isFallback;
    }
}