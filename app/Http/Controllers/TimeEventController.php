<?php

namespace App\Http\Controllers;

use App\Http\Resources\TimeEventResource;
use App\Models\TimeEvents;
use DateTime;
use Illuminate\Validation\Validator;

class TimeEventController extends ApiController{
    use GetDataInModel;
    protected string $model = TimeEvents::class;
    protected $filterOnSend = ['eventsdata_id','sender_id'];
    public function __construct(){
        parent::__construct(TimeEventResource::class);
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

    protected function makeChecker($ctx): Validator{
        $rules = [
            'date'=>'required|date',
            'eventsdata_id'=>'required|integer|numeric',
            'sender_id'=>'required|integer|numeric'
        ];
        return $this->validator($rules);
    }
}
