<?php

namespace Tests\Events;

use App\Events\Scheduler\Runner;
use App\Models\EventsData;
use App\Models\Location;
use App\Models\LocSender;
use App\Models\Sender;
use App\Models\TimeEvents;
use GuzzleHttp\Handler\MockHandler;


class CalendarRunnerTest extends \Tests\TestCase{
    use \Illuminate\Foundation\Testing\RefreshDatabase;
    use GuzzleHttpTestTrait;
    public static function createMockClient(MockHandler $mock){
        $handler = \GuzzleHttp\HandlerStack::create($mock);
        $client = new \GuzzleHttp\Client(['handler'=>$handler]);
        \App\Events\Scheduler\Location\HttpRequestMode::setDefaultClient($client);
        return $handler;
    }
    public function test_fire_single_event(){
        $sender = Sender::factory()->create();
        $called = false;
        $location = Location::create([
            "name"=>"testLoc",
            "type"=>1,
            "data"=>json_encode(["u"=>"http://localhost:8000","m"=>"GET"])
        ]);
        LocSender::factory()->for($sender)->for($location)->create(["isFallback"=>0]);
        $time = new \DateTime('now');
        $time->modify('-1 second');
        $timeEvent = TimeEvents::factory()
        ->for(EventsData::factory()->create())
        ->for($sender)
        ->create(["date"=>$time->format(DB_DATETIME_PATTERN)]);
        $handler = new GuzzleHttpTestHandler();

        //$this->createMockClient(new MockHandler([function() use(&$called){$called = true;return new Response;}]));

        $runner = new Runner;
        $runner->run();
        $this->assertModelMissing($timeEvent);
        $this->assertSendedRequestTo($handler,"/http:\/\/localhost:8000.*/");
    }

}