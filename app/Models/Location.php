<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Location extends Model
{
    use HasFactory;
    public $timestamps = true;
    public function LocSenders():HasMany{
        return $this->hasMany(LocSender::class);
    }
}
