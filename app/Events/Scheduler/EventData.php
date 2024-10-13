<?php

namespace App\Events\Scheduler;

class EventData{
    private $data;
    private const LIST = [
        1=>'pcr_reminder_1'
    ];

    public function __construct(private int $id,int $type,DbBulk $bulk,string $data){
        if(!isset($this::LIST[$type])){
            throw new \Error('Invalid Passed Type');
        };
        $this->data = $this->{$this::LIST[$type]}($bulk,json_decode($data));
    }
    private function pcr_reminder_1(DbBulk $bulk,$data){
        $bulk->delete('eventsdatas',$this->id);
        return [
            "name"=>$data[0],
            "description"=>$data[1]
        ];
    }
    public function get(){
        return $this->data;
    }
    public function getId(){
        return $this->id;
    }
}