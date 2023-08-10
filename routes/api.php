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
Route::prefix('sender')->group(function (){
    Route::get('/',[SenderController::class,'all']);
    Route::post('/',[SenderController::class,'create']);
    
    Route::get('/{item}',[SenderController::class,'get']);
    Route::delete('/{item}',[SenderController::class,'delete']);

});


Route::prefix('location')->group(function (){
    Route::get('/',[LocationController::class,'all']);
    Route::post('/',[LocationController::class,'create']);
    
    Route::get('/{item}',[LocationController::class,'get']);
    Route::delete('/{item}',[LocationController::class,'delete']);
});
Route::prefix('locsender')->group(function (){
    Route::get('/',[LocSenderController::class,'all']);
    Route::post('/',[LocSenderController::class,'create']);

    Route::get('/{item}',[LocSenderController::class,'get']);
    Route::delete('/{item}',[LocSenderController::class,'delete']);
});