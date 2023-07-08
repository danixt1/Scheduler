<?php

use Illuminate\Support\Facades\DB;

trait DbRef{
    protected string $tableName;
    protected int $id = null;

    abstract static public function getItem($id):mixed;
    protected function setId(int $id){
        $this->id = $id;
    }
    public function getId(){
        return $this->id;
    }

}