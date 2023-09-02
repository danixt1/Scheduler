<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class IndexController extends Controller
{
    public function show(){

        return Inertia::render("app");
    }
}
