<?php

namespace App\Http\Controllers;

use App\Models\Sender;
use Illuminate\Http\JsonResponse;

class SenderController extends ApiController{
    use GetDataInModel;
    protected string $model = Sender::class;
    public function __construct()
    {
        parent::__construct(['name'],['id','name']);
    }
    protected function makeChecker(array &$data): Checker
    {
        $checker = new Checker($data);
        $checker->checkType('name','string');
        $checker->check('name',function($val){
            return strlen($val) > 3;
        });
        return $checker;
    }
}