<?php

namespace Tests\Feature;

use App\Models\EventsData;
use App\Models\Location;
use App\Models\LocSender;
use App\Models\Sender;
use App\Models\TimeEvents;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;
//TODO
class TimeEventTestDB extends TestCase
{
    protected static $LOC_COUNT = 4;
    /**
     * @param array<string,int> $count
     * @return array<string,\Illuminate\Database\Eloquent\Collection>
     */
    protected static function make_db($count = []):array{
        Artisan::call('migrate:fresh');
        $count = array_merge(
            [
                'events'=>2,
                'locations'=>4,
                'senders'=>2,
                'locSenders'=>4,
                'timeEvents'=>2
            ],$count
        );
        $get = fn($ev,$class) => $count[$ev] instanceof Collection ? $count[$ev] : $class::factory($count[$ev])->create();
        $events = $get('events',EventsData::class);
        
        $locations =$get('locations',Location::class);
        $senders =$get('senders',Location::class);
        $locSenders = new Collection();
        $timeEvents = new Collection();
        for ($act=0; $act <$count['locSenders'] ; $act++) { 
            $locSenders->push(LocSender::factory()->for($locations->random())->for($senders->random()));
        };
        for ($act2=0; $act2 < $count['timeEvents'] ; $act2++) { 
            $timeEvents->push(TimeEvents::factory()->for($events->random())->for($senders->random()));
        }
        return [
            'events'=>$events,
            'locations'=>$locations,
            'senders'=>$senders,
            'locSenders'=>$locSenders,
            'timeEvents'=>$timeEvents
        ];
    }
    public function test_example(): void{
        $vals =self::make_db([]);
    }
}
