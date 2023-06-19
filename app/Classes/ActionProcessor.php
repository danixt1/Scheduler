<?php
namespace App\Classes;
use Illuminate\Support\Facades\DB;
use Exception;

class ActionProcessor{
    protected array $names;
    protected array $delete = [];
    protected array $update = [];

    public function __construct(array $relativeNames){
        $this->names = $relativeNames;
        foreach($relativeNames as $tableName){
            $this->delete[$tableName] = [];
            $this->update[$tableName] = [];
        };

    }
    public function action(array $act,array $ids){
        $tableName =$this->names[$act["target"]];
        $relativeName = $act["target"];
        $actionName = $act["action"];
        $id = $ids[$relativeName];
        
        switch($actionName){
            case 'delete':
                $this->delete[$tableName][] = $id;
                break;
            case 'update':
                $CollumsToUpdate = $act["data"];
                $this->update[$tableName][] = [$id,$CollumsToUpdate];
                break;
            default:
                throw new Exception("No action registred to ".$actionName);
                break;
        };
    }
    public function execute(){
        foreach($this->names as $tableName){
            foreach($this->update[$tableName] as $update){
                $id = $update[0];
                $vals = $update[1];
                DB::table($tableName)->where("id",$id)->update($vals);
            };
            DB::table($tableName)->whereIn("id",$this->delete[$tableName])->delete();
            
        }
    }
}