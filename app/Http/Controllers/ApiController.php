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
    protected $onGet = [];
    public function __construct(protected string $model,private $createProps,private $props = ['*']){
        $this->onGet = $this->setItem();
    }
    function all(Request $request){
        $data =$this->model::all($this->props)->toArray();
        foreach ($data as $key => $value) {
            $data[$key] = $this->buildItem($value);
        }
        return response()->json($data);
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
        return response()->json($this->buildItem($result->toArray()));
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
                if($e->getCode() === 23000){
                    Log::info($e->getMessage());
                    return $this->response_invalid_foreign_key($e->getMessage());
                }else{
                    Log::critical($e->getMessage());
                }
                return response('',500);
            }
            return response('',201);
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
            try {
                $val = $this->model::where('id',$item)->update($setData);
            } catch (QueryException $e) {
                if($e->getCode() === "23000"){
                    Log::info($e->getMessage());
                    return $this->response_invalid_foreign_key($e->getMessage());
                }else{
                    Log::critical($e->getMessage());
                }
                return response('',500);
            }
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
    protected function setItem(){
        return [];
    }
    private function buildItem(array $item){
        foreach ($this->onGet as $key => $value) {
            $item[$key] =isset($item[$key]) ? $value($item[$key],$item):  $value($item);
        }
        return $item;
    }
}