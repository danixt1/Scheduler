<?php

namespace App\Http\Controllers;

use App\Http\Resources\LocSenderResource;
use App\Models\LocSender;
use Illuminate\Validation\Validator;

class LocSenderController extends ApiController{
    use GetDataInModel;
    protected string $model = LocSender::class;
    protected $filterOnSend = ['location_id','sender_id'];
    public function __construct(){
        parent::__construct(['isFallback','location_id','sender_id'],LocSenderResource::class);
    }
    static public function name(): string{
        return "LocSender";
    }
    public static function toDb(): DbResolver
    {
        $resolver = new DbResolver;
        return $resolver;
    }

    protected function makeChecker($ctx): Validator{
        $rules = [
            'isFallback'=>'boolean',
            'location_id'=>'required|numeric|integer',
            'sender_id'=>'required|numeric|integer'
        ];
        return $this->validator($rules);
    }
}
