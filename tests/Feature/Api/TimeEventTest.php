<?php

namespace Tests\Feature\Api;

use App\Models\EventsData;
use App\Models\Sender;
use App\Models\TimeEvents;
use Illuminate\Database\Eloquent\Model;

class TimeEventTest extends ApiCase{
    function model(): string{
        return TimeEvents::class;
    }
    function apiName(): string{
        return "timeevent";
    }
    function apiCreate(): array{
        $ev = EventsData::factory()->create()->id;
        $sender =Sender::factory()->create()->id;
        return [
            [
                "send"=>[
                    "date"=>"2023-12-05 13:21:42",
                    "eventsdata_id"=>$ev,
                    "sender_id"=>$sender
                ],
                "expected"=>"CREATED"
            ]
        ];
    }
    function apiRead(): array{
        return [
            $this->make(),$this->make(),$this->make()
        ];
    }
    function apiUpdate(): array{
        return [
            [
                "model"=>$this->make(),
                "send"=>["date"=>"2025-12-05 12:00:32"],
                "expected"=>"NO_CONTENT"
            ],
            [
                "model"=>$this->make(),
                "send"=>["date"=>"2025-12-05 25:00:32"],
                "expected"=>["BAD_REQUEST",["error"=>"invalid_data","property"=>"date"]]
            ],
            [
                "model"=>$this->make(),
                "send"=>["sender_id"=>3241451],
                "expected"=>["BAD_REQUEST",["error"=>"invalid_key"]]
            ]
        ];
    }
    function apiDelete(): Model{
        return $this->make();
    }
    private function make(){
        return TimeEvents::factory()->for(EventsData::factory()->create())->for(Sender::factory()->create())->create();
    }
}