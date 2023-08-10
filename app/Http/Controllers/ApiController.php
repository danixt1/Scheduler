<?php
namespace App\Http\Controllers;

use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class ApiController extends Controller{
    use ApiTrait;
    public function __construct(protected string $model,private $createProps,private $props = ['*']){
    }
    function all(){
        return response()->json($this->model::all($this->props));
    }
    function delete(string $item){
        $res = $this->model::destroy($item);
        return $res == 1 ? response('',204) : $this->response_not_found();
    }
    function get(string $item){
        $result = $this->model::find((int)$item);
        if($result == null){
            return $this->response_not_found();
        }
        return response()->json($result);
    }
    protected abstract function checkerCreate(array &$data):null | Response;
    function create(Request $request){
        $data =$request->all($this->createProps);
        $res = $this->checkerCreate($data);
        if(!$res){
            try{
                $this->model::create($data);
            }catch(QueryException $e){
                $code = $e->getCode();
                if($e->getCode() === $code){
                    return $this->response_invalid_foreign_key($e->getMessage());
                }
                return response('',500);
            }
            return response('',204);
        }else{
            return $res;
        }
    }
}