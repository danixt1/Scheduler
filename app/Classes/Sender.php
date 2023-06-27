<?php 
namespace App\Classes;

use App\Classes\LocationBuilder;
use Illuminate\Support\Arr;

class Sender{
    private array $locations = [];
    private array $fallbacks = [];
    private string $name = '';

    public function __construct(array $data){
        $this->locations = $data['locations'];
        $this->fallbacks = $data['fallbacks'];
        $this->name = $data['name'];
    }
    public function sendData(array $dataToSend){
        $dataToSend = array_merge($dataToSend,['sender'=>$this->name,'isFallback'=>false]);
        foreach($this->locations as $location){
            $res = $this->runLoc($location,$dataToSend);
            if(!$res){
                $this->callFallbacks($dataToSend);
            }
        }
    }
    private function callFallbacks(array $dataToSend){
        $dataToSend = array_merge($dataToSend,['isFallback'=>true]);
        foreach($this->fallbacks as $fallback){
            $this->runLoc($fallback,$dataToSend);
        }
    }
    private function runLoc($loc,mixed $send,&$execDetail = null){
        $type = $loc['type'];
        $data = $loc['data'];
        $execDetail = [];
        if(!LocationBuilder::locationValidator($data,$type,$execDetail)){
            return false;
        };
        $loc = LocationBuilder::create($data,$type);
        return $loc->send($send);
    }
}
?>