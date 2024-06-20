<?php

namespace Tests\Events;

use PHPUnit\Framework\AssertionFailedError;

trait GuzzleHttpTestTrait{
    public function assertRequestCount(GuzzleHttpTestHandler $handler,$count){
        if($handler->countRequests() != $count){
            throw new AssertionFailedError("expected $count" + " returned " + $handler->countRequests());
        }
    }
    public function assertNotSendedRequestTo(GuzzleHttpTestHandler $handler,$url){
        if(count($handler->getRequestsFromUrl($url)) > 0){
            throw new AssertionFailedError("Sended the not expected request to the url: ".$url);
        }
    }
    public function assertSendedRequestTo(GuzzleHttpTestHandler $handler,$url){
        if(count($handler->getRequestsFromUrl($url)) < 1){
            throw new AssertionFailedError("Not Sended expected request: ".$url);
        }
    }
}