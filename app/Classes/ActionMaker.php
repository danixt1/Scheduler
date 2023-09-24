<?php
namespace App\Classes;
class ActionMaker{
    private string $ref;
    protected function __construct(private string $type,private array $data = []){
    }
    public static function update(array $data){
        return new self("update",$data);
    }
    public static function delete(string $actionName = ''){
        $newF = new self("delete");
        $newF->in($actionName);
        return $newF;
    }
    public function in(string $actionName){
        $this->ref = $actionName;
        return $this;
    }
    public function get(){
        return ["action"=>$this->type,"target"=>$this->ref,"data"=>$this->data];
    }
}