<?php
namespace App\Http\Controllers;

trait GetDataInModel{
    //protected string $model;
    protected function data_all():array{
        return $this->model::all($this->props)->toArray();
    }
    protected function data_destroy(string $item):int{
        return $this->model::destroy($item);
    }
    protected function data_item(string $item):null | array{
        $val =$this->model::find((int)$item,$this->props);
        return $val ? $val->toArray() : null;
    }
    protected function data_create(array $data):int{
        $info =$this->model::create($data);
        return $info->id;
    }
    protected function data_update(string $id,array $dataToSet):int{
        return $this->model::where('id',$id)->update($dataToSet);
    }
}