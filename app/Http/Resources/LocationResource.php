<?php

namespace App\Http\Resources;

use App\Http\DataType\DataTypeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
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
            "name"=>$this->name,
            "data"=>DataTypeResource::get('location',$this->type,$this->data),//json_decode($this->data),
            "type"=>$this->type
        ];
    }
}
