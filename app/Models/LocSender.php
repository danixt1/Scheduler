<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocSender extends Model
{
    protected $table = 'locsenders';
    use HasFactory;
    protected $fillable = ['isFallback','location_id','sender_id'];

    public function location():BelongsTo{
        return $this->belongsTo(Location::class);
    }
    public function sender():BelongsTo{
        return $this->belongsTo(Sender::class);
    }
}
