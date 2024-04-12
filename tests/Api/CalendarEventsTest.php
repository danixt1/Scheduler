<?php

namespace Tests\Api;

use App\Models\EventsData;
use App\Models\Sender;
use App\Models\TimeEvents;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class CalendarEventsTest extends ApiCase{
    function model(): string{
        return EventsData::class;
    }
    function apiName(): string{
        return 'events/calendar';
    }
    function apiCreate(): array{
        $sender = Sender::factory()->create();
        return [
            [
                "send"=>[
                    "data"=>["name"=>"test","description"=>"first test"],
                    "date"=>"2023-12-05 13:21:42",
                    "sender_id"=>$sender->id,
                    "type"=>1
                ],
                "expected"=>["CREATED"],
                "inDb"=>["type"=>1,"data"=>'["test","first test"]']
            ],
            [
                "send"=>[
                    "data"=>["name"=>1,"description"=>"first test"],
                    "date"=>"2023-12-05 13:21:42",
                    "sender_id"=>$sender->id,
                    "type"=>1
                ],
                "expected"=>["BAD_REQUEST"],
            ],
            [
                "send"=>[
                    "data"=>["name"=>"test","description"=>"first test"],
                    "date"=>"2023-12-05 13:21:42",
                    "sender_id"=>"invalid_id",
                    "type"=>1
                ],
                "expected"=>["BAD_REQUEST"]
            ]
        ];
    }
    function apiRead(): array{
        $collection = new Collection();
        for ($i=0; $i < 3; $i++) { 
            $data = EventsData::factory()->create();
            TimeEvents::factory()->for($data)->for(Sender::factory()->create())->create();
            $collection->push($data);
        }
        return [
            $collection
        ];
    }
    function apiUpdate(): array{
        $data =EventsData::factory()->create();
        $data2 = EventsData::factory()->create();
        TimeEvents::factory()->for($data)->for(Sender::factory()->create())->create();
        TimeEvents::factory()->for($data2)->for(Sender::factory()->create())->create();
        return [
            [
                "model"=>$data,
                "send"=>["date"=>"2021-12-05 12:21:42"],
                "expected"=>"NO_CONTENT"
            ],
            [
                "model"=>$data,
                "send"=>["date"=>"not as valid date"],
                "expected"=>"BAD_REQUEST"
            ],
            [
                "model"=>$data2,
                "send"=>["data"=>["name"=>"update","description"=>"after update"],"type"=>1],
                "expected"=>"NO_CONTENT"
            ]
        ];
    }
    function apiDelete(): Model{
        return EventsData::factory()->create();
    }
}