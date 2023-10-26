<?php

namespace Tests\Feature\Api;

use App\Models\EventsData;
use Illuminate\Database\Eloquent\Model;

class EventsDataTest extends ApiCase{
    function model():string{
        return EventsData::class;
    }
    function apiName(): string{
        return "events/data";
    }
    function apiCreate(): array{
        return [
            [
                "send"=>["type"=>1,"data"=>["name"=>"test","description"=>"simple test"]],
                "expected"=>["CREATED"],
                "inDb"=>["type"=>1,"data"=>'["test","simple test"]']
            ],
            [
                "send"=>["type"=>1,"data"=>["name"=>"test2","description"=>null]],
                "expected"=>"CREATED",
                "inDb"=>["type"=>1,"data"=>'["test2",""]']
            ],
            [
                "send"=>["type"=>1,"data"=>["name"=>"test3"]],
                "expected"=>["CREATED"],
                "inDb"=>["type"=>1,"data"=>'["test3",""]']
            ]
        ];
    }
    function apiRead(): array{
        return [
            EventsData::factory(3)->create()
        ];
    }
    function apiUpdate(): array{
        return [
            [
                "model"=>EventsData::factory()->create(),
                "send"=>["type"=>1,"data"=>["name"=>'a',"description"=>'b']],
                "expected"=>"NO_CONTENT"
            ]
        ];
    }
    function apiDelete(): Model
    {
        return EventsData::factory()->create();
    }
}