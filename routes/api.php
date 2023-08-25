<?php

use App\Http\Controllers\EventsDataController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\LocSenderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SenderController;
use App\Http\Controllers\TimeEventController;

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
//TODO make two new paths one to add unique(reminder) events adding to eventsdata table and timeevent table other to get a name from the refered timeevent table to frontend usage
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
$cruds = [
    ['sender',SenderController::class],
    ['location',LocationController::class],
    ['locsender',LocSenderController::class],
    ['timeevent',TimeEventController::class],
    ['eventsdata',EventsDataController::class]
];
foreach($cruds as $crud){
    $class = $crud[1];
    Route::prefix($crud[0])->middleware("cache.headers:private;max_age=5")->group(function() use ($class){
        Route::get('/',[$class,'all']);
        Route::post('/',[$class,'create']);
        
        Route::post('/{item}',[$class,'update']);
        Route::get('/{item}',[$class,'get']);
        Route::delete('/{item}',[$class,'delete']);
    });
};