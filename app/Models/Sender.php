<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sender extends Model
{
    use HasFactory;

    protected $fillable = ['name'];
    protected $hidden = ['created_at','updated_at'];
    public function LocSenders():HasMany{
        return $this->hasMany(LocSender::class);
    }
}
