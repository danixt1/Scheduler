<?php

namespace App\Http\Controllers;

use App\Classes\CalendarEventBuilder;
use App\Models\EventsData;

class EventsDataController extends ApiController{
    use GetDataInModel;
    protected string $model = EventsData::class;
    public function __construct(){
        parent::__construct(
            ['type','data'],
            ['id','type','data']
        );
    }
    protected function makeChecker(array &$data): Checker{
        $checker = new Checker($data);
        $checker->checkType('type','integer')->
            checkType('data','array')->check('data',function ($val,&$ret) use ($data){
                if(!isset($data['type'])){
                    $ret =["message"=> '"type" property is required to update/create'];
                    return false;
                };
                $type = $data['type'];
                $res = CalendarEventBuilder::validate($val,$type);
                return $res;
            })->
            addBuilder('data',function($val) use ($data){
                return CalendarEventBuilder::passToDb($val,$data['type']);
            });
        return $checker;
    }
    protected function setItem(){
        return [
            "data"=>function($data,$item){
                return CalendarEventBuilder::create(json_decode($data),$item['type'])->getData();
            }
        ];
    }
}