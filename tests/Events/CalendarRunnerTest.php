<?php

namespace Tests\Events;

use App\Events\Scheduler\Runner;
use App\Models\EventsData;
use App\Models\Location;
use App\Models\LocSender;
use App\Models\Sender;
use App\Models\TimeEvents;
use DateTime;
use GuzzleHttp\Psr7\Response;

class CalendarRunnerTest extends \Tests\TestCase{
    use \Illuminate\Foundation\Testing\RefreshDatabase;
    use GuzzleHttpTestTrait;

    private function createLocation($port = 8000,$method = "GET"){
        $location =Location::factory()->create(["type"=>1,"data"=>json_encode(["u"=>"http://localhost:".$port,"m"=>$method])]);
        return [$location,"http://localhost:".$port.($method == 'GET' ? "*" : "")];
    }
    private function createLocSender($location,$sender,$isFallback = false){
        LocSender::factory()->for($location)->for($sender)->create(["isFallback"=>$isFallback]);
    }
    private function dateTimeNowModif($modif){
        $time = new \DateTime('now');
        $time->modify($modif);
        return $time;
    }
    private function createTimeEvent(DateTime $time,$sender,$eventsData = null){
        return TimeEvents::factory()
        ->for($eventsData ?? EventsData::factory()->create())
        ->for($sender)
        ->create(["date"=>$time->format(DB_DATETIME_PATTERN)]);
    }
    public function test_fire_single_event(){
        $sender = Sender::factory()->create();

        [$location,$url] = $this->createLocation();
        [$callback,$url2] = $this->createLocation(7000);

        $this->createLocSender($location,$sender);
        $this->createLocSender($callback,$sender,true);

        $time = $this->dateTimeNowModif('-1 second');
        $timeEvent = $this->createTimeEvent($time,$sender);
        $handler = new GuzzleHttpTestHandler();

        (new Runner)->run();

        $this->assertModelMissing($timeEvent);
        $this->assertSendedRequestTo($handler,$url);
        $this->assertNotSendedRequestTo($handler,$url2);
    }
    public function test_not_fire_event(){
        $time = $this->dateTimeNowModif('+1 second');

        $sender = Sender::factory()->create();
        [$location,$url] = $this->createLocation();
        $this->createLocSender($location,$sender);
        $timeEvent = $this->createTimeEvent($time,$sender);
        $handler = new GuzzleHttpTestHandler();

        (new Runner)->run();

        $this->assertModelExists($timeEvent);
        $this->assertNotSendedRequestTo($handler,$url);
    }
    public function test_call_callback_after_fail(){
        $time = $this->dateTimeNowModif('-1 second');

        $sender = Sender::factory()->create();
        [$location,$url] = $this->createLocation();
        [$callback,$url2] = $this->createLocation(7000);

        $this->createLocSender($location,$sender);
        $this->createLocSender($callback,$sender,true);

        $timeEvent = $this->createTimeEvent($time,$sender);
        $handler = new GuzzleHttpTestHandler();
        $handler->add($url,new Response(400));

        (new Runner)->run();

        $this->assertModelMissing($timeEvent);
        $this->assertSendedRequestTo($handler,$url);
        $this->assertSendedRequestTo($handler,$url2);
    }
}