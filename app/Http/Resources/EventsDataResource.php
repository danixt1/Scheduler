<?php

namespace App\Http\Resources;

use App\Classes\CalendarEventBuilder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventsDataResource extends JsonResource
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
            "type"=>$this->type,
            "data"=>CalendarEventBuilder::create(json_decode($this->data),$this->type)->getData()
        ];
    }
}
