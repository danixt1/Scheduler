<?php

namespace App\Http\Controllers;

use App\Classes\CalendarEventBuilder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TimeEvents;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class IndexController extends Controller
{
    public function show(){
        //TODO limit the quanty of events to send and only return more on request
        $finalEvs = Cache::get('getter',function(){
            $evs =DB::table('timeevents')->
            join('eventsdatas','timeevents.eventsdata_id','=','eventsdatas.id')->
            select('timeevents.date','eventsdatas.type','eventsdatas.data')->get()->all();
            $act = [];
            foreach ($evs as $ev) {
                $event = CalendarEventBuilder::create(json_decode($ev->data),$ev->type);
                $info = $event->getData();
    
                $act[] = [
                    'date'=>$ev->date,
                    'type'=>$event->getName(),
                    'desc'=>$info['description'],
                    'name'=>$info['name']
                ];
            };
            return $act;
        });
        Cache::put('getter',$finalEvs,30);
        return Inertia::render("app",[
            'events'=>$finalEvs
        ]);
    }
}
