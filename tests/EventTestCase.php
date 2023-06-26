<?php
namespace Tests;
use Tests\TestCase;
use App\Classes\CalendarEventBuilder;

abstract class EventTestCase extends TestCase{
    protected CalendarEventBuilder $event;
    public function __construct(CalendarEventBuilder $ev,string $name){
        parent::__construct($name);
        $this->event = $ev;
    }
    public function test_action_result_is_valid(){
        $res = $this->event->action();
        $this->assertArrayHasKey('action',$res);
        $this->assertArrayHasKey('target',$res);
        $this->assertContains($res['action'],["update","delete"],"invalid string in property action, passed value:".$res['action']);
        if($res['action'] === 'update'){
            $this->assertArrayHasKey('data',$res);
            $this->assertIsArray($res['data']);
        };

    }
    abstract function test_getData_is_valid();
}