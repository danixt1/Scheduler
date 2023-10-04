<?php

namespace Tests\Feature;

use App\Classes\TimeEvent;
use App\Models\EventsData;
use App\Models\Location;
use App\Models\LocSender;
use App\Models\Sender;
use App\Models\TimeEvents;
use DateTime;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Tests\TestCase;

class TimeEventTestDB extends TestCase{
    use RefreshDatabase;

    private function createTimeEvent(
        array $event =['type'=>1,'data'=>['test','just a simple test']],
        DateTime | null $date = null,
        array $locations = [["name"=>"test","data"=>["u"=>"http://localhost:8999"],"fallback"=>false,"type"=>1]],
        array $sender = ["name"=>"test"]
    ){
        $d = $date == null ? new DateTime() : $date;
        $locIds = [];
        $senderId = Sender::create($sender)->id;
        $eventId = EventsData::create(["type"=>$event['type'],"data"=>json_encode($event["data"])])->id;
        foreach ($locations as $location) {
            $loc =Location::create([
                "name"=>$location['name'],
                "data"=>json_encode($location['data']),
                "type"=>$location['type']
            ]);
            $locIds[] = ["id"=>$loc->id,"fallback"=>$location['fallback']];
        };
        foreach ($locIds as $value) {
            LocSender::create(['isFallback'=>$value['fallback'],'location_id'=>$value['id'],"sender_id"=>$senderId]);
        }
        return TimeEvents::create([
            'date'=>$d->format(DB_DATETIME_PATTERN),
            'eventsdata_id'=>$eventId,
            'sender_id'=>$senderId
        ]);
    }

    public function test_check_if_trigger_is_executed(): void{
        $date = new DateTime();
        $date->modify('-1 second');
        $te = $this->createTimeEvent(date:$date);
        TimeEvent::extractFromDb();
        $this->assertModelMissing($te);
    }
    public function test_not_execute_event(): void{
        $date = new DateTime();
        $date->modify('+1 minute');
        $te = $this->createTimeEvent(date:$date);
        TimeEvent::extractFromDb();
        $this->assertModelExists($te);
    }
}