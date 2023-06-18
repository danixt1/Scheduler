<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Classes\TimeEvent;
use Illuminate\Database\Seeder;

use App\Models\Location;
use App\Models\Sender;

use App\Models\LocSender;
use App\Models\TimeEvents;
use App\Models\EventsData;

use Illuminate\Database\Eloquent\Collection;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void{
        $locs = Location::factory()->count(20)->create();
        $sender = Sender::factory()->count(3)->create();

        $uniqueEvents = EventsData::factory()->count(20)->create();

        $locsSenders = new Collection();
        $timeEvents = new Collection();
        foreach($locs as $loc){
            $locSender = LocSender::factory()->count(1)->for($loc)->for($sender->random())->create();
            $locsSenders->push($locSender);
        };

        foreach($uniqueEvents as $ev){
            $timeEvent = TimeEvents::factory()->count(1)->for($ev)->for($sender->random())->create();
            $timeEvents->push($timeEvent);
        }
    }
}
