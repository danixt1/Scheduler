<?php
namespace App\Http\Controllers;

trait ApiTrait{
    function response_multi_invalid_properties($props){
        return response()->json([
                'error'=>'invalid_data',
                'properties'=>$props
            ],400);
    }
    function response_no_data(){
        return response()->json([
            'error'=>'no_data',
            'message'=>'expected data but nothing has been send'
        ],400);
    }
    function response_not_found(){
        return response()->json([
            'error'=>'not_found',
            'message'=>'The specificied id not exist'
        ],404);
    }
    function response_invalid_foreign_key($message){
        return response()->json([
            'error'=>'invalid_key',
            'message'=>'The specificied foreing id not exist'
        ],400);
    }
}