<?php
namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\JsonResource;
/**
 * Add abstract methods using default model usage
 */
trait GetDataInModel{
    //protected string $model;
    protected function data_all():Builder{
        return $this->model::query();
    }
    protected function data_destroy(string $item):int{
        return $this->model::destroy($item);
    }
    protected function data_item(string $item):null | JsonResource | array{
        $val =$this->model::find((int)$item);
        if($val){
            return $this->resource ? new $this->resource($val) : $val->toArray();
        }
        return null;
    }
    protected function data_create(array $data):int{
        $info =$this->model::create($data);
        return $info->id;
    }
    protected function data_update(string $id,array $dataToSet):int{
        return $this->model::where('id',$id)->update($dataToSet);
    }
}