<?php

namespace Tests\Events;

use App\Events\Scheduler\DbBulk;
use App\Events\Scheduler\EventData;

class EventDataTest extends \Tests\TestCase{
    public function test_add_reminder_type(){
        $bulk = new DbBulk;
        $expect = [
            "name"=>"theName",
            "description"=>"desc"
        ];
        $ev = new EventData(0,1,$bulk,json_encode(["theName","desc"]));
        $this->assertEqualsCanonicalizing($expect,$ev->get());
        
    }
}