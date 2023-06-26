<?php

namespace App\Events;
use App\Classes\CalendarEventBuilder;

class Reminder extends CalendarEventBuilder{
    private string $name;
    private string $desc;

    public function __construct(array $data){
        $this->name = $data[0];
        $this->desc = $data[1];
    }
    public function getData():array{
        return [
            'name'=>$this->name,
            'description'=>$this->desc
        ];
    }
    public function action(): array{
        return ["action"=>"delete","target"=>"event"];
    }
}
?>