<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('timeevents', function (Blueprint $table) {
            $table->id();
            $table->dateTime('date');
            $table->foreignId('eventsdata_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeevents');
    }
};
