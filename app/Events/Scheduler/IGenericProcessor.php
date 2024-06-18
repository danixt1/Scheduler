<?php 

namespace App\Events\Scheduler;

use GuzzleHttp\Promise\Promise;

interface IGenericProcessor{
    public function run():ProcessResult | Promise;
    public function isAsync():bool;
    public function getProcessingResult():null | ProcessResult;
    public function failed():bool;
}