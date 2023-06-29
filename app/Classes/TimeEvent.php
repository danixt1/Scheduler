<?php 

namespace App\Classes;

use App\Classes\CalendarEventBuilder;
use DateTime;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

const DB_QUERY = 'SELECT te.id,s.id as sender_id,l.id as location_id,ed.id as event_id,s.name,te.date,ed.type as eventType,ed.data as eventData,l.data as locData,ls.isFallback,l.type as locType FROM timeevents as te 
INNER JOIN senders as s ON s.id = te.sender_id 
INNER JOIN eventsdatas as ed on ed.id = te.eventsdata_id 
INNER JOIN locsenders as ls ON s.id = ls.sender_id 
INNER JOIN locations as l ON l.id = ls.location_id';

class TimeEvent{
    public function __construct(private string $date,private Sender $sender,private CalendarEventBuilder $calendar){
        /*
        $this->id = $firstRow->id;
        $this->date = $firstRow->date;
        $this->calendarEventData = [
            "id"=>$firstRow->event_id,
            "data"=>json_decode($firstRow->eventData),
            "type"=>$firstRow->eventType
        ];
        $this->senderData = [
            "id"=>$firstRow->sender_id,
            "name"=>$firstRow->name,
            "fallbacks"=>[],
            "locations"=>[]
        ];*/
        //$this->insert($firstRow);
    }
    /**
     * @Throws
     */
    public function fire(ActionProcessor $actPrc){
        $sender = $this->sender;
        $calendar = $this->calendar;
        $act =$calendar->getAction();

        /*
        $this->senderData["fallbacks"] = $this->fallbacks;
        $this->senderData["locations"] = $this->locations;

        $sender = new \App\Classes\Sender($this->senderData);
        $calendarEvent =  CalendarEventBuilder::create($this->calendarEventData["data"],$this->calendarEventData['type']);
        $eventResult = $calendarEvent->getData();
        $act = $calendarEvent->action();
        if($act){
            $actPrc->action($act,["event"=>$this->id,"trigger"=>$this->calendarEventData["id"]]);
        }
        $sender->sendData($eventResult);*/
        return true;

    }
    public static function extractFromDb(){
        $act = new DateTime();
        $act = $act->modify('-1 minute');
        
        $results = 0;
        $success = 0;
        $failed = 0;
        $exceptions = [];
        $totEvents = 0;
        $eventsQuery = self::runQuery($act);
        $first = array_shift($eventsQuery);

        if(!isset($first)){
            return ["rows"=>$results,"success"=>$success,"failed"=>$failed,"events"=>$totEvents];
        }

        $actionProcessor = new ActionProcessor(["event"=>"eventsdatas","trigger"=>"timeevents"]);
        $fireEv = function(TimeEvent $ev) use (&$failed,&$exceptions,$actionProcessor){
            try{
                $ev->fire($actionProcessor);
            }catch(Throwable $e){
                $failed++;
                $exceptions[] = [$e];
            }
        };
        $timeEv = new TimeEvent($first);
        $actTimed = $first->id;
        $totEvents++;
        foreach( $eventsQuery as $event){
            $results++;
            if($event->id == $actTimed){
                $timeEv->insert($event);
                continue;
            }
            $totEvents++;
            $timeEv = new TimeEvent($event,$actionProcessor);
            $fireEv($timeEv);
            $actTimed = $event->id;
        }
        $fireEv($timeEv);
        $actionProcessor->execute();
        return ["rows"=>$results,"success"=>$success,"failed"=>$failed,"events"=>$totEvents,"exceptions"=>$exceptions];

    }
    public static function runQuery(DateTime $date = null){
        return $date === null ? DB::select(DB_QUERY) : DB::select(DB_QUERY . ' WHERE te.date < ?;',[$date->format(DB_DATETIME_PATTERN)]);
    }
}
