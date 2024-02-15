<?php

namespace App\Http\Controllers;

use App\Classes\CalendarEventBuilder;
use App\Http\Resources\EventsDataResource;
use App\Models\EventsData;

class EventsDataController extends ApiController{
    use GetDataInModel;
    protected string $model = EventsData::class;
    public function __construct(){
        parent::__construct(
            ['type','data'],
            EventsDataResource::class
        );
    }
    public static function name(): string{
        return "EventsData";
    }
    public static function toDb(): DbResolver{
        $resolver = new DbResolver;
        $resolver->modify('data',function($data,$all){
            return CalendarEventBuilder::passToDb($data,$all['type']);
        });
        return $resolver;
    }
    protected function makeChecker(): Checker{
        $checker = new Checker();
        $checker->checkType('type','integer')->
            checkType('data','array')->check('data',function ($val,&$ret,$data){
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
}