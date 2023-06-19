<?php 

namespace App\Classes;

use App\Classes\CalendarEventGetter;
use DateTime;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

const DB_QUERY = 'SELECT te.id,s.id as sender_id,l.id as location_id,ed.id as event_id,s.name,te.date,ed.type as eventType,ed.data as eventData,l.data as locData,ls.isFallback,l.type as locType FROM timeevents as te 
INNER JOIN senders as s ON s.id = te.sender_id 
INNER JOIN eventsdatas as ed on ed.id = te.eventsdata_id 
INNER JOIN locsenders as ls ON s.id = ls.sender_id 
INNER JOIN locations as l ON l.id = ls.location_id WHERE te.date < ?;';

class TimeEvent{
    private array $senderData;
    private array $calendarEventData = [];
    private string $date;
    private array $fallbacks = [];
    private array $locations = [];
    private int $id;
    public function __construct($first,private ActionProcessor $actPrc){
        $this->id = $first->id;
        $this->date = $first->date;
        $this->calendarEventData = [
            "id"=>$first->event_id,
            "data"=>json_decode($first->eventData),
            "type"=>$first->eventType
        ];
        $this->senderData = [
            "id"=>$first->sender_id,
            "name"=>$first->name,
            "fallbacks"=>[],
            "locations"=>[]
        ];
        $this->insert($first);
        //id,sender_id,location_id,name,date,eventType,eventData,locData,isFallback,locType  
    }
    public function insert($data){
        $location = [
            "id"=>$data->location_id,
            "data"=>json_decode($data->locData),
            "type"=>$data->locType
        ];
        if($data->isFallback === 1){
            $this->fallbacks[] = $location;
        }else{
            $this->locations[] = $location;
        }
    }
    public function fire(){
        $this->senderData["fallbacks"] = $this->fallbacks;
        $this->senderData["locations"] = $this->locations;
        //{act:delete,table:'a'},{act:update,table:'a'}

        $calendarEvent =  CalendarEventGetter::create($this->calendarEventData["data"],$this->calendarEventData['type']);
        $eventResult = $calendarEvent->getData();
        $act = $calendarEvent->action();
        $this->actPrc->action($act,["event"=>$this->id,"trigger"=>$this->calendarEventData["id"]]);
    }
    public static function extractFromDb(){
        $act = new DateTime();
        $act = $act->modify('-1 minute');
        
        $results = 0;
        $success = 0;
        $failed = 0;
        $exceptions = [];

        $totEvents = 0;
        $events = DB::select(DB_QUERY,[$act->format(DB_DATETIME_PATTERN)]);
        $first = array_shift($events);

        if(!isset($first)){
            return ["rows"=>$results,"success"=>$success,"failed"=>$failed,"events"=>$totEvents];
        }

        $actionProcessor = new ActionProcessor(["event"=>"eventsdatas","trigger"=>"timeevents"]);
        $timeEv = new TimeEvent($first,$actionProcessor);
        $actTimed = $first->id;
        $totEvents++;
        foreach( $events as $event){
            $results++;
            if($event->id != $actTimed){
                $totEvents++;
            try{
                    $timeEv->fire();
            }catch(Exception $e){
                $failed++;
                    $exceptions[] = $e;
        }
                $timeEv = new TimeEvent($event,$actionProcessor);
                $actTimed = $event->id;
            }else{
                $timeEv->insert($event);
    }
    }
        $timeEv->fire();
        return ["rows"=>$results,"success"=>$success,"failed"=>$failed,"events"=>$totEvents,"exceptions"=>$exceptions];
    }
}
