<?php

namespace App\Events;

use App\Classes\ActionMaker;
use App\Classes\CalendarEventBuilder;

class Reminder extends CalendarEventBuilder{
    private string $name;
    private string $desc;
    private int $id; 

    static protected $checker = [
        "name"=>[
            'required'=>True,
            'type'=>'string'
        ],
        "description"=>[
            'required'=>False,
            'type'=>'string'
        ]
    ];
    public static function isDataValid(array $data, ?array &$ret = null): bool{
        $res = self::check(self::$checker,$data);
        if(is_array($ret)){
            foreach($res as $prop){
                $ret[] = $prop;
            };
        };
        return $res[0] === 'passed';
    }

    public function __construct(array $data,int $id = -1){
        $this->name = $data[0];
        $this->desc = isset($data[1]) ? $data[1] : '';
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
    public static function toDb(array $data): string{
        if(!isset($data['description'])){
            $data['description'] = '';
        }
        $name = $data['name'];
        $desc = $data['description'];
        return json_encode([$name,$desc]);
    }
}
?>