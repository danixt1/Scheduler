<?php 
namespace App\Classes;

use App\Classes\DataGetter;
use DateTime;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
const DB_QUERY = 'SELECT te.id,s.name,te.date,ed.type as itemType,ed.data as data,s.id as locs FROM timeevents as te 
INNER JOIN senders as s ON s.id = te.sender_id 
JOIN eventsdatas as ed on ed.id = te.eventsdata_id WHERE te.date < ?;';

class TimeEvent{
    private Sender $sender;
    private DateTime $date;
    private mixed $eventsdata;
    private DataGetter $action;

    public static function extractFromDb(){
        $act = new DateTime();
        $act = $act->modify('-1 minute');
        $success = 0;
        $failed = 0;
        $events = DB::select(DB_QUERY,[$act->format(DB_DATETIME_PATTERN)]);
        foreach( $events as $event){
            try{
                $timeEvent = new TimeEvent($event);
                $timeEvent->fire();
                $success++;
            }catch(Exception $e){
                if(get_class($e) === 'ErrorException'){
                    throw $e;
                }
                Log::error('DB->timeevents[{id}] failed processing event,additional informations:{error}',
                ['id'=>$event->id,'error'=>$e->getMessage()]);
                $failed++;
                continue;
            };
        }
        return ['total'=>$success + $failed,'failed'=>$failed,'success'=>$success];
    }
    public function __construct(object $event){
        $this->date = new DateTime($event->date);
        $this->sender = new Sender($event->locs);

        $data= (gettype($event->data) === 'string')? json_decode($event->data) : $event->data;
        if(!isset($data)){
            throw new Exception('Invalid JSON format in property "data"');
        };
        $this->eventsdata = $event;
        $this->action = DataGetter::create($data,$event->itemType);
    }
    public function fire(){
        $act = $this->action;
        Log::info($act->action());
        Log::info($act->getData());
    }
}
?>