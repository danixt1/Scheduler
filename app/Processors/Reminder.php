<?php

namespace App\Processors;
use App\Classes\DataGetter;

class Reminder extends DataGetter{
    private string $name;
    private string $desc;

    public function __construct(array $data){
        $this->name = $data[0];
        $this->desc = $data[1];
    }
    public function getData():array{
        return [
            'name'=>$this->name,
            'desc'=>$this->desc
        ];
    }
    public function action(): array{
        return ["action"=>"delete","target"=>"event"];
    }
}
?>