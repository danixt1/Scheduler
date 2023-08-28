<?php

namespace Tests\Feature\Api;

use App\Models\Location;
use Illuminate\Database\Eloquent\Model;

class LocationTest extends ApiCase{

    function model(): string{
        return Location::class;
    }
    function apiName(): string{
        return 'locations';
    }
    function apiCreate(): array{
        return [
            [
                "send"=>["name"=>"test","data"=>["u"=>"http://test.com"],"type"=>1],
                "expected"=>"CREATED"
            ]
        ];
    }
    function apiRead(): array{
        return [Location::factory(3)->create()];
    }
    function apiUpdate(): array{
        return [
            [
                "model"=>Location::factory()->create(),
                "send"=>["name"=>"new name to test"],
                "expected"=>"NO_CONTENT"
            ],
            [
                "model"=>Location::factory()->create(),
                "send"=>["data"=>["u"=>"http://newtest.com"],"type"=>1],
                "expected"=>"NO_CONTENT"
            ]
        ];
    }
    function apiDelete(): Model{
        return Location::factory()->create();
    }
}