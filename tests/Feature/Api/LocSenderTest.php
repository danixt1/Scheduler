<?php

namespace Tests\Feature\Api;

use App\Models\Location;
use App\Models\LocSender;
use App\Models\Sender;
use Illuminate\Database\Eloquent\Model;

class LocSenderTest extends ApiCase{
    function model(): string{
        return LocSender::class;
    }
    function apiName(): string{
        return "locsenders";
    }
    function apiCreate(): array{
        $location = Location::factory()->create();
        $sender = Sender::factory()->create();
        return [
            [
                "send"=>[
                    "isFallback"=>False,
                    "location_id"=>$location->id,
                    "sender_id"=>$sender->id
                ],
                "expected"=>"CREATED"
            ]
        ];
    }
    function apiRead(): array{
        return [$this->make()];
    }
    function apiUpdate(): array{
        return [
            [
                "model"=>$this->make(),
                "send"=>["isFallback"=>True],
                "expected"=>"NO_CONTENT"
            ]
        ];
    }
    function apiDelete(): Model{
        return $this->make();
    }
    private function make(){
        return LocSender::factory()->for(Location::factory()->create())->for(Sender::factory()->create())->create();
    }
}