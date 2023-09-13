<?php

namespace App\Providers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use SQLite3;

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
    public function boot(): void{
        if(config('database.default') === 'sqlite'){
            $db = config('database.connections.sqlite.database');
            if(!file_exists($db)){
                $db =new SQLite3($db);
                $db->close();
            }

        }
        if(!defined('DB_DATETIME_PATTERN'))
            define('DB_DATETIME_PATTERN',env('DB_DATETIME_PATTERN','Y-m-d H:i:s'));
        Schema::defaultStringLength(500);
    }
}
