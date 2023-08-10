<?php

use App\Http\Controllers\LocationController;
use App\Http\Controllers\LocSenderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SenderController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
$cruds = [
    ['sender',SenderController::class],
    ['location',LocationController::class],
    ['locsender',LocSenderController::class]
];
foreach($cruds as $crud){
    $class = $crud[1];
    Route::prefix($crud[0])->group(function() use ($class){
        Route::get('/',[$class,'all']);
        Route::post('/',[$class,'create']);
        
        Route::post('/{item}',[$class,'update']);
        Route::get('/{item}',[$class,'get']);
        Route::delete('/{item}',[$class,'delete']);
    });
};