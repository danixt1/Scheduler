<?php

namespace App\Http\Controllers;

use App\Classes\CalendarEventBuilder;
use App\Http\Resources\EventsDataResource;
use App\Models\EventsData;
use Illuminate\Validation\Validator;

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
    protected function makeChecker($ctx): Validator{
        $rules = [
            'type'=>'required|numeric|integer|between:1,1',
            'data'=>'required|array'
        ];
        $type1 = [
            'data.name'=>'required|string',
            'data.description'=>'string'
        ];
        $validator = $this->validator($rules)->
        after(function (Validator $validator) use($ctx){
            $data = $validator->getData();
            if($ctx === 'update' && !isset($data['type'])){
                $validator->errors()->add('type','type is always required in update');
            }
        });
        $validator->addRules($type1);
        return $validator;
    }
}