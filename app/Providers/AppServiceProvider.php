<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if(!defined('DB_DATETIME_PATTERN'))
            define('DB_DATETIME_PATTERN',env('DB_DATETIME_PATTERN','Y-m-d H:i:s'));
        Schema::defaultStringLength(500);
    }
}
