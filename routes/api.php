<?php

use App\Http\Controllers\EventsDataController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\LocSenderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SenderController;
use App\Http\Controllers\TimeEventController;
use App\Http\Controllers\CalenderEventsController;

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
$makeRoutes = function(array $cruds,string $version){
    foreach($cruds as $crud){
        $class = $crud[1];
        Route::prefix($version.'/'.$crud[0])->middleware("cache.headers:private;max_age=5")->group(function() use ($class){
            Route::get('/',[$class,'all']);
            Route::post('/',[$class,'create']);
            
            Route::post('/{item}',[$class,'update']);
            Route::get('/{item}',[$class,'get']);
            Route::delete('/{item}',[$class,'delete']);
        });
    };
};
$crudsV1 = [
    ['events/calendar',CalenderEventsController::class],
    ['events/data',EventsDataController::class],
    ['events/timers',TimeEventController::class],
    ['senders',SenderController::class],
    ['locations',LocationController::class],
    ['locsenders',LocSenderController::class]
];
$makeRoutes($crudsV1,'v1');