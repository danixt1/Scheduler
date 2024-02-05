<?php

namespace App\Http\Controllers;

use App\Http\Resources\TimeEventResource;
use App\Models\TimeEvents;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class TimeEventController extends ApiController{
    use GetDataInModel;
    protected string $model = TimeEvents::class;
    protected $filterOnSend = ['eventsdata_id','sender_id'];
    public function __construct(){
        parent::__construct(
            ['date','eventsdata_id','sender_id'],
            TimeEventResource::class
        );
    }
    static public function name(): string{
        return "TimeEvent";
    }
    public static function toDb(): DbResolver{
        $resolver = new DbResolver;
        $resolver->modify('date',function($date){
            return (new DateTime($date))->format(DB_DATETIME_PATTERN);
        });
        return $resolver;
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
        });
        return $checker;
    }
}
