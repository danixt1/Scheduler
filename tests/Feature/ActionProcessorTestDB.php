<?php

namespace Tests\Feature;

use App\Classes\ActionMaker;
use App\Classes\ActionProcessor as act;
use App\Models\EventsData;
use App\Models\Location;
use App\Models\Sender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActionProcessorTestDB extends TestCase{
    use RefreshDatabase;
    
    public function test_action_processor_with_del(){
        $act = new act(['event'=>'eventsdatas','sender'=>'senders']);
        $delEvent = ActionMaker::delete('event');
        $delSender= ActionMaker::delete('sender');
        for ($i=0; $i <5; $i++) { 
            $act->action($delEvent,['event'=>EventsData::factory()->create()->id]);
            $act->action($delSender,['sender'=>Sender::factory()->create()->id]);
        };
        $act->execute();
        $this->assertDatabaseEmpty('eventsdatas');
        $this->assertDatabaseEmpty('senders');
    }
    public function test_action_processor_with_update(){
        $act = new act(['loc'=>'locations','sender'=>'senders']);
        $updLoc = ActionMaker::update(["name"=>"LOC_TEST"])->in('loc');
        $updSender= ActionMaker::update(["name"=>"SENDER_TEST"])->in('sender');

        Sender::factory()->create(['name'=>'NOT_CHANGE_SENDER']);
        Location::factory()->create(['name'=>'NOT_CHANGE_LOCATION']);

        $senderModels = Sender::factory(3)->create();
        $locModels = Location::factory(3)->create();
        foreach ($senderModels as $senderModel) {
            $act->action($updSender,['sender'=>$senderModel->id]);
        }
        foreach ($locModels as $locModel) {
            $act->action($updLoc,['loc'=>$locModel->id]);
        }
        $act->execute();
        foreach ($senderModels as $senderModel) {
            $senderModel->refresh();
            $this->assertEquals($senderModel->name,'SENDER_TEST');
        }
        foreach ($locModels as $locModel) {
            $locModel->refresh();
            $this->assertEquals($locModel->name,'LOC_TEST');
        }
        $this->assertDatabaseHas('locations',['name'=>'NOT_CHANGE_LOCATION']);
        $this->assertDatabaseHas('senders',['name'=>'NOT_CHANGE_SENDER']);
    }
}