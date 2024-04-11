<?php
namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Validator;

interface Icrud{
    function all(Request $request);
    function create(Request $request):Response | ResponseFactory;
    function get(string $item): Response | ResponseFactory;
    function delete(string $item):Response|ResponseFactory;
    function update(Request $request,string $item):Response|ResponseFactory;
}
/** Base class of all Api Controllers */
abstract class ApiController extends Controller implements Icrud{
    use ApiTrait;
    private $onGet = [];
    private $skipBuild = False;

    private $validatorMessages = [];
    private $userData = [];
    /** Store the actual context being used, actually support 2 ctxs: create/update */
    private $ctx = '';
    protected $filterOnSend = [];
    public function __construct(private $createProps,protected $resource){
        $this->onGet = $this->setItem();
        if(count($this->onGet) == 0){
            $this->skipBuild = True;
        }
    }
    abstract static public function name():string;
    abstract static function toDb():DbResolver;
    abstract protected function data_all():Builder|\Illuminate\Database\Query\Builder;
    abstract protected function data_destroy(string $item):int;
    abstract protected function data_item(string $item):null | JsonResource | array;
    /**
     * Called after succefull validation and filtering, execute the creation in DB,
     *  case creation process is only usign one model use `GetDataInModel` trait
     * to auto make the fn
     */
    abstract protected function data_create(array $data):int;
    /** Return the quantity of updated items */
    abstract protected function data_update(string $id,array $dataToSet):int;
    /** Validator encapsulator. */
    function validator($rules){
        $userData = $this->beforeValidation($this->userData,$this->ctx);
        $sendRules = [];
        if($this->ctx == 'update'){
            foreach($userData as $key => $value){
                if(array_key_exists($key,$rules)){
                    $sendRules[$key] = $rules[$key];
                };
            };
        }else{
            $sendRules = $rules;
        }
        return Validator::make($userData,$sendRules,$this->validatorMessages);
    }
    function changeValidationMessage($type,string $msg){
        $this->validatorMessages[$type] = $msg;
    }
    /** Override this function if is necessary to sanitize the data before validation */
    protected function beforeValidation($userData,string $ctx){
        return $userData;
    }
    function all(Request $request){
        $querys = $request->query();
        $data =$this->data_all();
        foreach ($querys as $key => $value) {
            if(str_ends_with($key,'_id')){
                $data =$data->where($key,intval($value));
            }
        }
        return $this->resource::collection($data->paginate(10));
    }
    function delete(string $item):Response{
        $res = $this->data_destroy($item);
        return $res == 1 ? response('',204) : $this->response_not_found();
    }
    function get(string $item):Response{
        $get = Cache::get($this::class.$item);
        if($get){
            return response()->json($get);
        }

        $result = $this->data_item($item);
        if($result == null){
            return $this->response_not_found();
        }
        Cache::put($this::class.$item,$result,1);
        return response()->json($result);
    }
    protected abstract function makeChecker($ctx):\Illuminate\Validation\Validator;
    function create(Request $request):Response{
        $this->userData = $request->all();
        $this->ctx = 'create';
        $validator = $this->makeChecker('create');

        if($validator->fails()){
            return $this->response_multi_invalid_properties($validator->errors()->all());
        }
        $passData = $this::toDb()->resolve($validator->validated());
        try{
            $info =$this->data_create($passData);
        }catch(QueryException $e){
            if($e->getCode() === "23000"){
                Log::info($e->getMessage());
                return $this->response_invalid_foreign_key($e->getMessage());
            }
            Log::critical($e->getMessage());
            return response('',500);
        }
        return response($info,201);
    }
    function update(Request $request,string $item):Response{
        $this->userData = $request->all();
        $this->ctx = 'update';
        $validator = $this->makeChecker('update');
        
        if($validator->fails()){
            return $this->response_multi_invalid_properties($validator->errors()->all());
        }

        $setData = $this::toDb()->resolve($validator->validated());
        try {
            $val =$this->data_update($item,$setData);
        } catch (QueryException $e) {
            if($e->getCode() === "23000"){
                Log::info($e->getMessage());
                return $this->response_invalid_foreign_key($e->getMessage());
            }
            Log::critical($e->getMessage());
            return response('',500);
        }
        if($val == 0){
            return $this->response_not_found();
        }
        return response('',204);
    }
    protected function setItem(){
        return [];
    }
    private function makeResponseFromCheckerArray(array $result){
        $type = $result[0];
        $args = array_slice($result,1);
        $methodName = 'response_' . $type;
        if(!$methodName){
            throw new Exception("Unexpected error type passed By Checker class.\n
            not exist response to error: $type");
        }
        return [$this,$methodName](...$args);
    }
}