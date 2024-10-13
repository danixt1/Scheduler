<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Location;
use App\Models\Sender;

use App\Models\LocSender;
use App\Models\TimeEvents;
use App\Models\EventsData;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void{
        $locs = Location::factory()->count(10)->create();
        $sender = Sender::factory()->count(3)->create();

        $uniqueEvents = EventsData::factory()->count(10)->create();

        foreach($locs as $loc){
            LocSender::factory()->count(1)->for($loc)->for($sender->random())->create();
        };

        foreach($uniqueEvents as $ev){
            TimeEvents::factory()->count(1)->for($ev)->for($sender->random())->create();
        }
    }
}
