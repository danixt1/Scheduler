<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class LocSenderResource extends JsonResource
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
            'isFallback'=>$this->isFallback === 1,
            'location'=>URL::to("/api/v1/locations/".$this->location_id),
            'sender'=>URL::to("/api/v1/senders/".$this->sender_id)
        ];
    }
}
