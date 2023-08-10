<?php

namespace App\Http\Controllers;

use App\Models\LocSender;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LocSenderController extends ApiController
{
    public function __construct()
    {
        parent::__construct(LocSender::class,['isFallback','location_id','sender_id'],['id','isFallback','location_id','sender_id']);
    }
    protected function checkerCreate(array &$data): ?Response{
        if(!isset($data['isFallback'])){
            $data['isFallback'] = false;
        };
        return null;
    }
}
