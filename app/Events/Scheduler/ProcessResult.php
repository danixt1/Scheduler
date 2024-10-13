<?php 

namespace App\Events\Scheduler;

class ProcessResult{
    public function __construct(private int $code = 0,private string $error = ''){}
    public function getError(){
        return $this->error;
    }
    public function getCode(){
        return $this->code;
    }
    public function failed(){
        return $this->code != 0;
    }
}