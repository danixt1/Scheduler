<?php
namespace App\Locations;

use Exception;
use Illuminate\Support\Facades\Http;

class HttpRequestMode extends \App\Classes\LocationBuilder{
    private string $method = 'GET';
    private string $url = '';
    private array $header = [];
    private string $putDataIn = 'default';

    static protected $checker = [
        'u'=>[
            'required'=>true,
            'type'=>'string',
            'pattern'=>'/^https?:\/\//'
            ],
        'm'=>[
            'required'=>false,
            'type'=>'string',
            'equal'=>['GET','POST','DELETE','UPDATE']
        ],
        'h'=>[
            'required'=>false,
            'type'=>'object'
        ],
        'd'=>[
            'required'=>false,
            'type'=>'string',
            'equal'=>['default','header','query','json']
        ]
    ];
    static protected $defHeader = [
        'User-Agent'=>'Scheduler'
    ];
    public static function isDataValid(array $data,array &$ret = null):bool{
        $res = self::check(self::$checker,$data);
        if(is_array($ret)){
            foreach($res as $prop){
                $ret[] = $prop;
            };
        };
        return $res[0] === 'passed';
    }

    public function __construct(array $data){
        $this->url = $data['u'];
        if(isset($data['h'])){
            $this->header = (array) $data['h'];
        }
        if(isset($data['m'])){
            $this->method = $data['m'];
        }
        if(isset($data['d'])){
            $this->putDataIn = $data['d'];
        }
    }
    public function send(array $data): bool{
        $putDataIn = $this->getPutDataIn();
        $query = [];
        $header = $this->header;
        switch($putDataIn){
            case 'header':
                $header = array_merge($header,$data);
                break;
            case 'query':
                $query = $data;
                break;
        }
        $header = array_merge($header,self::$defHeader);
        $add = http_build_query($query);
        $prepare =  Http::withHeaders($header);
        if($putDataIn === 'json'){
            $prepare->asJson()->withBody(json_encode($data));
        };
        try{
            $resp = $prepare->send($this->method,$this->url . ($add ? '?'.$add : ''));
            return $resp->successful();
        }catch(Exception $e){
            return false;
        }
    }
    private function getPutDataIn(){
        if($this->putDataIn === 'default'){
            if($this->method === 'GET'){
                return 'query';
            }else{
                return 'json';
            };
        }
        return $this->putDataIn;
    }
}