<?php

namespace App\Http\Controllers;

use App\Http\Resources\LocSenderResource;
use App\Models\LocSender;

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
    
    protected function makeChecker(): Checker{

        $checker = new Checker();
        $checker->checkType('isFallback','boolean')->
            checkType('location_id','integer')->
            checkType('sender_id','integer')->optional('isFallback');
        
        return $checker;
    }
}
