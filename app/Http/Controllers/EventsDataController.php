<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventsDataResource;
use App\Models\EventsData;
use Illuminate\Validation\Validator;

class EventsDataController extends ApiController{
    use GetDataInModel;
    use DataTypeTrait;
    protected string $model = EventsData::class;
    public function __construct(){
        parent::__construct(
            ['type','data'],
            EventsDataResource::class
        );
    }
    public static function dataName():string{
        return 'calendarEvent';
    }
    public static function name(): string{
        return "EventsData";
    }
    protected function makeChecker($ctx): Validator{
        $rules = [
            'type'=>'required|numeric|integer|between:1,1',
            'data'=>'required|array'
        ];
        $validator = $this->validator($rules);
        return $this->addRulesByTypes($validator,true);
    }
}