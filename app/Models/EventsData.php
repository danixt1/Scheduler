<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventsData extends Model
{
    protected $table = 'eventsdatas';
    use HasFactory;
    public function TimeEvents():HasMany{
        return $this->hasMany(TimeEvents::class,'eventsdata_id');
    }
}
