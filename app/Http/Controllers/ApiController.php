<?php
namespace App\Http\Controllers;

use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

interface Icrud{
    function all(Request $request):Response;
    function create(Request $request):Response | ResponseFactory;
    function get(string $item): Response | ResponseFactory;
    function delete(string $item):Response|ResponseFactory;
    function update(Request $request,string $item):Response|ResponseFactory;
}
abstract class ApiController extends Controller implements Icrud{
    use ApiTrait;
    private $onGet = [];
    private $skipBuild = False;
    protected $removeBeforeSend = [];

    public function __construct(private $createProps,protected $props = ['*']){
        $this->onGet = $this->setItem();
        if(count($this->onGet) == 0){
            $this->skipBuild = True;
        }
    }
    abstract protected function data_all():array;
    abstract protected function data_destroy(string $item):int;
    abstract protected function data_item(string $item):null | array;
    abstract protected function data_create(array $data):int;
    /** Return the quantity of updated items */
    abstract protected function data_update(string $id,array $dataToSet):int;

    function all(Request $request):Response{
        $data =$this->data_all();
        if(!$this->skipBuild){
            foreach ($data as $key => $value) {
                $data[$key] = $this->buildItem($value);
            }
        }
        return response()->json($data);
    }
    function delete(string $item):Response{
        $res = $this->data_destroy($item);
        return $res == 1 ? response('',204) : $this->response_not_found();
    }
    function get(string $item):Response{
        $result = $this->data_item($item);
        if($result == null){
            return $this->response_not_found();
        }
        if(!$this->skipBuild){
            $result = $this->buildItem($result);
        }
        return response()->json($result);
    }
    protected abstract function makeChecker(array &$data):Checker;
    function create(Request $request):Response{
        $data =$this->filter($request->all());
        $checker = $this->makeChecker($data);
        $res =$checker->execute();
        if(!$res){
            $passData = $checker->getArray();
            try{
                $info =$this->data_create($passData);
            }catch(QueryException $e){
                if($e->getCode() === 23000){
                    Log::info($e->getMessage());
                    return $this->response_invalid_foreign_key($e->getMessage());
                }else{
                    Log::critical($e->getMessage());
                }
                return response('',500);
            }
            return response($info,201);
        }else{
            return $res;
        }
    }
    function update(Request $request,string $item):Response{
        $data =$this->filter($request->all());
        $checker = $this->makeChecker($data);
        $collums = array_keys($data);
        $res = $checker->execute($collums);
        if($res == null){
            $setData = $checker->getArray();
            try {
                $val =$this->data_update($item,$setData);
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