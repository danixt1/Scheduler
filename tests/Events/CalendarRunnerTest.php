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
use PHPUnit\Framework\AssertionFailedError;

class CalendarRunnerTest extends \Tests\TestCase{
    use \Illuminate\Foundation\Testing\RefreshDatabase;
    use GuzzleHttpTestTrait;

    private function createLocationAndLinktoSender(Sender $sender,$isFallback =false){
        $location =Location::factory()->post()->create(["type"=>1]);
        $url = json_decode($location->data)->u;
        LocSender::factory()->for($location)->for($sender)->create(["isFallback"=>$isFallback]);
        return $url;
    }
    private function dateTimeNowModif($modif){
        $time = new \DateTime('now');
        if(!$time->modify($modif)){
            throw new \Error("Invalid modify");
        }
        return $time;
    }
    private function createTimeEvent(DateTime|string $time,$sender,$eventsData = null){
        if(is_string($time)){
            $time = $this->dateTimeNowModif($time);
        };
        return TimeEvents::factory()
        ->for($eventsData ?? EventsData::factory()->create())
        ->for($sender)
        ->create(["date"=>$time->format(DB_DATETIME_PATTERN)]);
    }
    public function test_fire_single_event(){
        $handler = new GuzzleHttpTestHandler();

        $sender = Sender::factory()->create();

        $url = $this->createLocationAndLinktoSender($sender);
        $url2 = $this->createLocationAndLinktoSender($sender,true);

        $timeEvent = $this->createTimeEvent('-1 second',$sender);

        (new Runner)->run();
        
        $this->assertModelMissing($timeEvent);
        $this->assertSendedRequestTo($handler,$url);
        $this->assertNotSendedRequestTo($handler,$url2);
    }
    public function test_not_fire_event(){
        $handler = new GuzzleHttpTestHandler();

        $sender = Sender::factory()->create();

        $url = $this->createLocationAndLinktoSender($sender);

        $timeEvent = $this->createTimeEvent('+1 second',$sender);

        (new Runner)->run();

        $this->assertModelExists($timeEvent);
        $this->assertNotSendedRequestTo($handler,$url);
    }
    public function test_call_callback_after_fail(){
        $handler = new GuzzleHttpTestHandler();

        $sender = Sender::factory()->create();

        $url = $this->createLocationAndLinktoSender($sender);
        $url2 = $this->createLocationAndLinktoSender($sender,true);

        $handler->add($url,new Response(400));

        $timeEvent = $this->createTimeEvent('-1 second',$sender);

        (new Runner)->run();
        
        $this->assertModelMissing($timeEvent);
        $this->assertSendedRequestTo($handler,$url);
        $this->assertSendedRequestTo($handler,$url2);
    }
    public function test_fire_many_events(){
        $this->refreshDatabase();
        $handler = new GuzzleHttpTestHandler();
        $reqs = [
            [true,0],
            [true,0],
            [false,1],
            [true,1],
            [false,0],
            [true,1]
        ];
        $sendersQuant = array_reduce($reqs,fn($prev,$act)=>$act[1] > $prev ? $act[1] : $prev,-1);
        $senders = Sender::factory()->count($sendersQuant + 1)->create()->all();
        $tests = [];
        $eventsDatas = EventsData::factory()->count(count($reqs))->create();
        foreach ($reqs as $value) {
            [$active,$linkToSender] = $value;
            $sender = $senders[$linkToSender];
            $this->createLocationAndLinktoSender($sender);
            $timeEvent = $this->createTimeEvent(($active ? '-' : '+') .'1 second' ,$sender,$eventsDatas->pop());
            $tests[] = [$active,$timeEvent];
        }  

        (new Runner)->run();
        foreach($tests as $key =>$test){
            try{
                [$active,$timeEvent] = $test;
                if($active){
                    $this->assertModelMissing($timeEvent);
                    continue;
                }
                $this->assertModelExists($timeEvent);
            }catch(AssertionFailedError $e){
                throw new AssertionFailedError("Failed ID $key message:\n{$e->getMessage()}");
            }
        }
    }

}