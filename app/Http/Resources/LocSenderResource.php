<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'location'=>route("Location.show",["item"=>$this->location_id]),
            'sender'=>route("Sender.show",["item"=>$this->sender_id])
        ];
    }
}
