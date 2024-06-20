<?php 

namespace App\Events\Scheduler;


use GuzzleHttp\Promise\PromiseInterface;

interface IGenericProcessor{
    public function run():ProcessResult | PromiseInterface;
    public function isAsync():bool;
    public function getProcessingResult():null | ProcessResult;
    public function failed():bool;
}