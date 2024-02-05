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

class CalendarEventsController extends ApiController{
    protected $filterOnSend = ['sender_id','eventsdata_id'];
    protected $props = ['timeevents.id','date','eventsdata_id','sender_id','type','data'];
    function __construct(){
        parent::__construct(['data','sender_id','date','type'],CalendarEventsResource::class);
    }
    static public function name(): string{
        return "CalendarEvent";
    }
    static function toDb(array $data): array
    {
        $data['date'] = (new \DateTime($data['date']))->format(DB_DATETIME_PATTERN);
        $data['data'] = CalendarEventBuilder::passToDb($data['data'],$data['type']);

        return $data; 
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
        $val = DB::table('timeevents')->
        join('eventsdatas','timeevents.eventsdata_id','=','eventsdatas.id')->
        where('timeevents.id',$id)->get($this->props)->first();
        if(!$val){
            return 0;
        }
        $evId = $val->eventsdata_id;
        $ev = [
            'type'=>isset($dataToSet['type']) ? $dataToSet['type'] : $val->type
        ];
        $te = [
            'date'=>isset($dataToSet['date']) ? $dataToSet['date'] : $val->date,
            'sender_id'=>isset($dataToSet['sender_id'])? $dataToSet['sender_id'] : $val->sender_id
        ];
        if(isset($dataToSet['data'])){
            $ev['data'] = $dataToSet['data'];
        }
        if(isset($dataToSet['data'])){
            EventsData::where('id',$evId)->update($ev);
        }
        if(isset($dataToSet['date']) || isset($dataToSet['sender_id'])){
            TimeEvents::where('id',$id)->update($te);
        };
        return 1;
    }
}