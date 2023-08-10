<?php
namespace App\Http\Controllers;

use App\Models\Location;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
    protected abstract function makeChecker(array &$data):Checker;
    function create(Request $request){
        $data =$this->filter($request->all());
        $checker = $this->makeChecker($data);
        $res =$checker->execute();
        if(!$res){
            $passData = $checker->getArray();
            try{
                $this->model::create($passData);
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
    function update(Request $request,string $item){
        $data =$this->filter($request->all());
        $checker = $this->makeChecker($data);
        $collums = array_keys($data);
        $res = $checker->execute($collums);
        if($res == null){
            $setData = $checker->getArray();
            $val = $this->model::where('id',$item)->update($setData);
            if($val == 0){
                return $this->response_not_found();
            }
            return response('',204);
        }else{
            return $res;
        }
    }
    private function filter(array $data){
        $ret = [];
        foreach ($this->createProps as $value) {
            if(!isset($data[$value])){
                continue;
            }else{
                $ret[$value] = $data[$value]; 
            };
        };
        return $ret;
    }
}