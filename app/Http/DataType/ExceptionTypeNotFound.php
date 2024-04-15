<?php

namespace App\Http\DataType;

use Exception;

class ExceptionTypeNotFound extends Exception{
    function __construct($dataName,$type){
        parent::__construct("type $type from $dataName not exist",404);
    }
}