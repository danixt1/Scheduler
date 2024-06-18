<?php

namespace App\Events\Scheduler\Location;

use App\Events\Scheduler\EventData;
use App\Events\Scheduler\Sender;
use Closure;

class LocationBase{
    const TYPES = [
        1=>HttpRequestMode::class
    ];
    protected function __construct(private bool $isFallback,private array $data){}

    public static function create(int $type,bool $isFallback,string $locData,EventData $evData,Closure $reporter){
        if(!isset(self::TYPES[$type])){
            throw new \Error("Invalid type");
        };
        return new (self::TYPES[$type])($isFallback,$locData,$evData,$reporter);
    }
    public function getIsFallback(){
        return $this->isFallback;
    }
}