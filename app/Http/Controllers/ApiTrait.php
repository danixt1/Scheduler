<?php
namespace App\Http\Controllers;

trait ApiTrait{
    function response_invalid_type($propName,$expected,$passed){
        return response()->json([
            'error'=>'invalid_data',
            'property'=>$propName,
            'expected'=>$expected,
            'passed_type'=>$passed,
            'message'=>"Data in property \"$propName\" is invalid expected $expected but returned type $passed"
        ],400);
    }
    function response_no_data(){
        return response()->json([
            'error'=>'no_data',
            'message'=>'expected data but nothing has been send'
        ],400);
    }
    function response_property_not_passed($prop){
        return response()->json([
            'error'=>'property_not_passed',
            'property'=>$prop,
            'message'=>"expected $prop"
        ],400);
    }
    function response_invalid_data($prop,$additionalInfo = null){
        $obj = [
            'error'=>'invalid_data',
            'property'=>$prop,
            'message'=>"Invalid data in property $prop"
        ];
        if(is_array($additionalInfo)){
            if(isset($additionalInfo['message'])){
                $obj['message'] = $additionalInfo['message'];
                unset($additionalInfo['message']);
            }
            if(count($additionalInfo) > 0){
                $obj['info'] = $additionalInfo;
            };
        };
        return response()->json($obj,400);
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