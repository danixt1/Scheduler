<?php

namespace App\Http\Controllers;

use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Validation\Validator;

class LocationController extends ApiController{
    use GetDataInModel;
    use DataTypeTrait;
    static private function dataName():string{
        return 'location';
    }
    protected string $model = Location::class;
    public function __construct(){
        parent::__construct(['name','data','type'],LocationResource::class);
    }
    static public function name(): string{
        return "Location";
    }
    protected function makeChecker($ctx): Validator{
        $rules = [
            'name'=>'required|string|min:3',
            'data'=>'required|array',
            'type'=>'required|integer|numeric|between:1,1'
        ];
        $validator = $this->validator($rules);
        return $this->addRulesByTypes($validator,true);
    }
}
