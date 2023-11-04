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
            'data'=>URL::to("/api/v1/events/data/".$this->eventsdata_id),
            'sender'=>URL::to("/api/v1/senders/".$this->sender_id),
            'date'=>$this->date
        ];
    }
}
