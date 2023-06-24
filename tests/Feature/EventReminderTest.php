<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\EventTestCase as TestCase;
use App\Events\Reminder;

class EventReminderTest extends TestCase
{
    public function __construct(string $name){
        parent::__construct(new Reminder(["name","description from reminder"]),$name);
    }
    public function test_getData_is_valid()
    {
        $data = $this->event->getData();
        $this->assertArrayHasKey('name',$data);
        $this->assertArrayHasKey('description',$data);
        $this->assertEquals('name',$data['name']);
        $this->assertEquals('description from reminder',$data['description']);
    }
}
