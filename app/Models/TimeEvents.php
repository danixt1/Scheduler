<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEvents extends Model
{
    protected $fillable = ['date','eventsdata_id','sender_id'];
    protected $table = 'timeevents';
    use HasFactory;
    public function sender():BelongsTo{
        return $this->belongsTo(Sender::class);
    }
    public function eventsData():BelongsTo{
        return $this->belongsTo(EventsData::class,"eventsdata_id");
    }
}
