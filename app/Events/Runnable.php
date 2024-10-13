<?php

namespace App\Events;

abstract class Runnable{
    abstract function run():bool;
}