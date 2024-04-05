<?php

namespace Tests\Api;

use App\Models\Location;
use App\Models\Sender;
use Illuminate\Database\Eloquent\Model;

class SenderTest extends ApiCase{

    function apiCreate(): array{
        $valid = Location::factory()->create();
        $others = Location::factory(5)->create()->map(fn($item)=>$item->id);
        return [
            [
                "send"=>[
                    "name"=>'fail test',
                    "ids"=>$others->toArray()
                ],
                "expected"=>[
                    "BAD_REQUEST",['error'=>'invalid_data','property'=>'ids']
                ]
            ],
            [
                "send"=>[
                    "name"=>'other_test',
                    "ids"=>[$valid->id]
                ],
                "expected"=>[
                    "CREATED"
                ],
                "inDb"=>[
                    "name"=>"other_test"
                ]
            ],
            [
                "send"=>[
                    "name"=>'test_name',
                    "ids"=>[]
                ],
                "expected"=>[
                    "CREATED"
                ],
                "inDb"=>[
                    "name"=>'test_name'
                ]
            ],
            [
                "send"=>[
                    "name"=>22,
                    "ids"=>[]
                ],
                "expected"=>[
                    "BAD_REQUEST",
                    ["error"=>"invalid_data","property"=>"name"]
                ]
            ]
        ];
    }
    function model(): string{
        return Sender::class;
    }
    function apiName(): string{
        return 'senders';
    }
    function apiRead(): array{
        return [Sender::factory(1)->create()];
    }
    function apiUpdate(): array{
        return [
            [
                "model"=>Sender::factory()->create(),
                "send"=>["name"=>"new test name"],
                "expected"=>"NO_CONTENT"
            ],
            [
                "model"=>Sender::factory()->create(),
                "send"=>["name"=>11],
                "expected"=>["BAD_REQUEST",["error"=>"invalid_data","property"=>"name"]]
            ]
        ];
    }
    function apiDelete(): Model{
        return Sender::factory()->create();
    }
}