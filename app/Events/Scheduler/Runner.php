<?php 

namespace App\Events\Scheduler;

use App\Events\Runnable;
use DateTime;
use Illuminate\Support\Facades\DB;

const DB_QUERY = 'SELECT te.id as id,s.id as sender_id,l.id as location_id,ed.id as event_id,s.name,te.date,ed.type as eventType,ed.data as eventData,l.data as locData,ls.isFallback,l.type as locType FROM timeevents as te 
INNER JOIN senders as s ON s.id = te.sender_id 
INNER JOIN eventsdatas as ed on ed.id = te.eventsdata_id 
INNER JOIN locsenders as ls ON s.id = ls.sender_id 
INNER JOIN locations as l ON l.id = ls.location_id';

class Runner extends Runnable{
    public function run(): bool{
        $eventsQuery = self::runQuery(new DateTime('now'));
        if(count($eventsQuery) == 0){
            return;
        }
        $bulk = new DbBulk;
        $senderBuilder = new SenderBuilder;
        $eventsData = [];
        foreach($eventsQuery as $query){
            $evData = isset($eventsData[$query->event_id]) ? $eventsData[$query->event_id] : new EventData($query->event_id,$query->eventType,$bulk,$query->eventData);

            if(isset($eventsData[$query->event_id]))
            $sender = $senderBuilder->buildSender($evData,$query->sender_id);
            $sender->buildLocation($query->locType,$query->isFallback,$query->locData);
        }
        if(!$bulk->execute()){
            return false;
        };
        $senderBuilder->fireAllLocations();
        return true;
    }
    public static function runQuery(DateTime $date = null){
        $query =DB_QUERY.($date === null ? '' : ' WHERE te.date < ?'). ' ORDER BY id;';
        return $date === null ? DB::select($query) : DB::select($query,[$date->format(DB_DATETIME_PATTERN)]);
    }
}