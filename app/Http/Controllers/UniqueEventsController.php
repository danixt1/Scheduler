<?php

namespace App\Http\Controllers;

use App\Classes\CalendarEventBuilder;
use App\Models\EventsData;
use App\Models\TimeEvents;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class UniqueEventsController extends ApiController{
    protected $props = ['timeevents.id','date','eventsdata_id','sender_id','type','data',
    'eventsdatas.created_at','eventsdatas.updated_at'];

    function __construct(){
        parent::__construct(['name','sender_id','description']);
    }
    protected function makeChecker(array &$data):Checker{
        if(!isset($data['description'])){
            $data['description'] = '';
        }
        $checker = new Checker($data);
        $checker->
            checkType('name','string')->
            checkType('date','string')->
            checkType('description','string')->
            checkType('sender_id','integer')->
            addBuilder('date',fn($date)=>(new \DateTime($date))->format(DB_DATETIME_PATTERN));
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
            select($this->props)->where('timeevents.id',$item)->first();

        return $val ? (array)$val: null;
    }
    protected function data_create(array $data):int{
        DB::beginTransaction();
        try {
            $ev =EventsData::create([
                'type'=>1,
                'data'=>json_encode([$data['name'],$data['description']])
            ]);
            TimeEvents::create([
                'date'=>$data['date'],
                'eventsdata_id'=>$ev->id,
                'sender_id'=>$data['id']
            ]);
            DB::commit();
            return $ev->id;
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }
    protected function data_update(string $id, array $dataToSet): int{
        return 0;
    }
    protected function setItem(){
        return [
            'data'=>fn($data,$item)=>CalendarEventBuilder::create(json_decode($data),$item['type'])->getData()
        ];
    }
}