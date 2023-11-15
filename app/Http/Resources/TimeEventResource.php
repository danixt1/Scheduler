<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class TimeEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'data'=>route("EventsData.show",["item"=>$this->eventsdata_id]),
            'sender'=>route("Sender.show",["item"=>$this->sender_id]),
            'date'=>$this->date
        ];
    }
}
