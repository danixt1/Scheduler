<?php

namespace App\Http\Resources;

use App\Http\DataType\DataTypeResource;
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
            "data"=>DataTypeResource::get("calendarEvent",$this->type,$this->data)
        ];
    }
}
