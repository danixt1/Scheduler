<?php

namespace App\Events;

use App\Classes\ActionMaker;
use App\Classes\CalendarEventBuilder;

class Reminder extends CalendarEventBuilder{
    private string $name;
    private string $desc;
    private int $id; 
    public function __construct(array $data,int $id = -1){
        $this->name = $data[0];
        $this->desc = $data[1];
        $this->id = $id;
    }
    public function getData():array{
        return [
            'name'=>$this->name,
            'description'=>$this->desc
        ];
    }
    public function getId(): int{
        return $this->id;
    }
    public function getAction(): ActionMaker{
        return ActionMaker::delete()->in("event");
    }
    public function getName(): string{
        return 'reminder';
    }
}
?>