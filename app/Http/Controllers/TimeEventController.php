<?php

namespace App\Http\Controllers;

use App\Models\TimeEvents;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class TimeEventController extends ApiController{
    use GetDataInModel;
    protected string $model = TimeEvents::class;

    public function __construct(){
        parent::__construct(
            ['date','eventsdata_id','sender_id'],
            ['id','date','eventsdata_id','sender_id']
        );
    }
    protected function makeChecker(array &$data): Checker{
        $checker = new Checker($data);
        $checker->
        checkType('date','string')->
        checkType('eventsdata_id','integer')->
        checkType('sender_id','integer')->check("date",function ($prop,&$ret){
            try {
                new DateTime($prop);
                return true;
            } catch (\Throwable $th) {
                $ret['message'] = "failed parsing time string";
                return false;
            }
        })->addBuilder('date',fn($date)=>(new DateTime($date))->format(DB_DATETIME_PATTERN));
        return $checker;
    }
    protected function setItem(){
        return [
            'data'=>fn($data)=>URL::to("/api/v1/events/datas/".$data['eventsdata_id']),
            'sender'=>fn($data)=>URL::to("/api/v1/senders/".$data['sender_id'])
        ];
    }
}
