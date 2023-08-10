<?php

namespace App\Http\Controllers;

use App\Models\Sender;
use Illuminate\Http\JsonResponse;

class SenderController extends ApiController{
    use ApiTrait;
    public function __construct()
    {
        parent::__construct(Sender::class,['name'],['id','name']);
    }
    protected function checkerCreate(array &$data): ?JsonResponse
    {
        $checker = new Checker($data);
        $checker->checkType('name','string');
        $checker->check('name',function($val){
            return strlen($val) > 3;
        });
        return $checker->finish();
    }
}