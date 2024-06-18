<?php 

namespace App\Events\Scheduler\Location;

use App\Events\Scheduler\IGenericProcessor;
use App\Events\Scheduler\ProcessResult;

abstract class LocationProcessor extends LocationBase implements IGenericProcessor{
    private ?ProcessResult $prcResult = null;
    protected function __construct(bool $isFallback,$data,private \Closure $reporter){
        parent::__construct($isFallback,$data);
    }
    public function getProcessingResult(): ?ProcessResult{
        return $this->prcResult;
    }
    public function failed(): bool{
        return $this->prcResult ? $this->prcResult->failed() : false;
    }
    protected function finish(ProcessResult $result){
        $this->prcResult = $result;
        if($result->failed()){
            ($this->reporter)($result);
        }
    }
}