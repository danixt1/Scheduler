<?php

namespace Tests\Feature\Api;

use App\Models\Sender;
use Illuminate\Database\Eloquent\Model;

class SenderTest extends ApiCase{

    function apiCreate(): array{
        return [
            [
                "send"=>[
                    "name"=>'test_name'
                ],
                "expected"=>[
                    "CREATED"
                ]
            ],
            [
                "send"=>[
                    "name"=>22
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