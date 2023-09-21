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
    public function __construct(
        private int $id,
        private string $date,
        private Sender $sender,
        private CalendarEventBuilder $calendar
    ){}
    /**
     * @Throws
     */
    public function fire(ActionProcessor $actPrc){
        $sender = $this->sender;
        $calendar = $this->calendar;
        $act =$calendar->getAction();
        $eventInfo = $calendar->getData();
        if($act){
            $idCalendar = $calendar->getId();
            if($idCalendar != -1)
                $actPrc->action($act,["event"=>$idCalendar,"trigger"=>$this->id]);
        }
        $sender->sendData($eventInfo);
    }
    public static function extractFromDb(){
        $act = new DateTime();
        $act = $act->modify('-1 minute');
        $stats = new Stats(['rows','triggers','errors','success']);

        $eventsQuery = self::runQuery($act);
        if(count($eventsQuery) == 0){
            return $stats->result();
        }
        $stats->set('rows',count($eventsQuery));
        $actionProcessor = new ActionProcessor(["event"=>"eventsdatas","trigger"=>"timeevents"]);
        $triggers = [];
        $trigger = [];
        $actId = $eventsQuery[0]->id;
        foreach($eventsQuery as $ev){
            if($actId != $ev->id){
                $triggers[] = $trigger;
                $trigger = [];
                $actId = $ev->id;
            };
            $trigger[] = $ev;
        }
        $triggers[] = $trigger;
        $stats->set('triggers',count($triggers));
        foreach($triggers as $ev){
            $data = [];
            try{
                $data = json_decode($ev[0]->eventData);
            }catch(Throwable $e){
                Log::error('Invalid DB data "eventData" don\'t is a valid string JSON format with row id {id}',(array)$ev[0]);
                $stats->add('errors');
                continue;
            }
            $event = CalendarEventBuilder::create($data,$ev[0]->eventType,$ev[0]->event_id);
            $locations = [];
            $fallbacks = [];

            foreach($ev as $row){
                $evData = $row->locData;
                try{
                    $evData = json_decode($evData);
                }catch(Throwable $e){
                    Log::error('Invalid DB data "locData" don\'t is a valid string JSON format with row id {id}',(array)$ev[0]);
                    $stats->add('errors');
                    continue;
                }
                $evType = $row->locType;
                $isFallback = $row->isFallback == 1;
                $location = LocationBuilder::create($evData,$evType);
                if($isFallback){
                    $fallbacks[] = $location;
                }else{
                    $locations[] = $location;
                }
            }
            $sender = new Sender($ev[0]->name,$locations,$fallbacks);
            $timedEvent = new TimeEvent($ev[0]->id,$ev[0]->date,$sender,$event);
            $timedEvent->fire($actionProcessor);
            $stats->add('success');
        }
        $actionProcessor->execute();
        return $stats->result();
    }
    public static function runQuery(DateTime $date = null){
        $query =DB_QUERY.($date === null ? '' : ' WHERE te.date < ?'). ' ORDER BY id;';
        return $date === null ? DB::select($query) : DB::select($query,[$date->format(DB_DATETIME_PATTERN)]);
    }
}
