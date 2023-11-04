<?php

namespace App\Http\Controllers;

use App\Classes\CalendarEventBuilder;
use App\Http\Resources\CalendarEventsResource;
use App\Models\EventsData;
use App\Models\TimeEvents;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;
//TODO make special case 
class CalenderEventsController extends ApiController{
    protected $filterOnSend = ['sender_id','eventsdata_id'];
    protected $props = ['timeevents.id','date','eventsdata_id','sender_id','type','data'];
    function __construct(){
        parent::__construct(['data','sender_id','date','type'],CalendarEventsResource::class);
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
    protected function data_all(): Builder|QueryBuilder{
        $data =  DB::table('timeevents')->
            join('eventsdatas','timeevents.eventsdata_id','=','eventsdatas.id')->select($this->props);
        return $data;
    }
    protected function data_destroy(string $item):int{
        return EventsData::destroy($item);
    }
    protected function data_item(string $item):null | JsonResource{
        $val = DB::table('timeevents')->
            join('eventsdatas','timeevents.eventsdata_id','=','eventsdatas.id')->
            where('timeevents.id',$item)->get($this->props)->first();

        return $val ? new CalendarEventsResource($val): null;
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
}