<?php

namespace App\Http\Controllers;

use App\Classes\CalendarEventBuilder;
use App\Models\EventsData;
use App\Models\TimeEvents;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class CalenderEventsController extends ApiController{
    protected $filterOnSend = ['sender_id','eventsdata_id'];
    function __construct(){
        parent::__construct(['data','sender_id','date','type'],['timeevents.id','date','eventsdata_id','sender_id','type','data']);
    }
    protected function makeChecker(array &$data):Checker{
        $checker = new Checker($data);
        $checker->
            checkType('date','string')->
            checkType('data','array')->
            checkType('sender_id','integer')->
            check('data',function ($val,&$ret) use ($data){
                if(!isset($data['type'])){
                    $ret =["message"=> '"type" property is required to update/create'];
                    return false;
                };
                $type = $data['type'];
                $res = CalendarEventBuilder::validate($val,$type);
                return $res;
            })->
            addBuilder('date',fn($date)=>(new \DateTime($date))->format(DB_DATETIME_PATTERN))->
            addBuilder('data',function($val) use ($data){
                return CalendarEventBuilder::passToDb($val,$data['type']);
            });
        return $checker;
    }
    protected function data_all():array{
        $data =  DB::table('timeevents')->
            join('eventsdatas','timeevents.eventsdata_id','=','eventsdatas.id')->
            get($this->props)->toArray();
        foreach ($data as $key => $value) {
            $data[$key] = (array)$value;
        }
        return $data;
    }
    protected function data_destroy(string $item):int{
        return EventsData::destroy($item);
    }
    protected function data_item(string $item):null | array{
        $val = DB::table('timeevents')->
            join('eventsdatas','timeevents.eventsdata_id','=','eventsdatas.id')->
            where('timeevents.id',$item)->get($this->props)->first();

        return $val ? (array)$val: null;
    }
    protected function data_create(array $data):int{
        DB::beginTransaction();
        try {
            $ev =EventsData::create([
                'type'=>1,
                'data'=>$data['data']
            ]);
            $te = TimeEvents::create([
                'date'=>$data['date'],
                'eventsdata_id'=>$ev->id,
                'sender_id'=>$data['sender_id']
            ]);
            DB::commit();
            return $te->id;
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }
    protected function data_update(string $id, array $dataToSet): int{
        //TODO
        return 0;
    }
    protected function setItem(){
        return [
            'timer'=>fn($item)=>URL::to('api/v1/events/timers/'.$item['id']),
            'event'=>fn($item)=>URL::to('api/v1/events/data/'.$item['eventsdata_id']),
            'sender'=>fn($item)=>URL::to('api/v1/senders/'.$item['sender_id']),
            'data'=>fn($data,$item)=>CalendarEventBuilder::create(json_decode($data),$item['type'])->getData()
        ];
    }
}