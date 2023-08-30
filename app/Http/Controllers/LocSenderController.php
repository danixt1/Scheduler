<?php

namespace App\Http\Controllers;

use App\Models\LocSender;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class LocSenderController extends ApiController{
    use GetDataInModel;
    protected string $model = LocSender::class;
    protected $filterOnSend = ['location_id','sender_id'];
    public function __construct(){
        parent::__construct(['isFallback','location_id','sender_id'],['id','isFallback','location_id','sender_id']);
    }
    protected function makeChecker(array &$data): Checker{
        if(!isset($data['isFallback'])){
            $data['isFallback'] = false;
        }
        $checker = new Checker($data);
        $checker->checkType('isFallback','boolean')->
            checkType('location_id','integer')->
            checkType('sender_id','integer');
        
        return $checker;
    }
    protected function setItem(){
        return [
            'location'=>fn($data)=>URL::to("/api/v1/locations/".$data['location_id']),
            'sender'=>fn($data)=>URL::to("/api/v1/senders/".$data['sender_id'])
        ];
    }
}
