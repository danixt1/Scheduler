<?php

namespace App\Http\Resources;

use App\Classes\CalendarEventBuilder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class CalendarEventsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id"=>$this->id,
            "date"=>$this->date,
            "type"=>$this->type,
            'timer'=>route("TimeEvent.show",["item"=>$this->id]),
            'event'=>route("EventsData.show",["item"=>$this->eventsdata_id]),
            'sender'=>route("Sender.show",["item"=>$this->sender_id]),
            'data'=>CalendarEventBuilder::create(json_decode($this->data),$this->type)->getData()
        ];
    }
}
