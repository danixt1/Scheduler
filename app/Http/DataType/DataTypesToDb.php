<?php
namespace App\Http\DataType;
use App\Http\Controllers\DbResolver;
use Error;
// On Adding new data transform to DB follow this rule in function name: <data_name>_<type_name>_<type_id>
// This rule is used by the get method to run the function.
class DataTypesToDb{
    static private $methods_info = null;
    static protected function location_HttpRequestMode_1($data){
        return json_encode($data);
    }
    static protected function calendarEvent_reminder_1($data){
        if(!isset($data['description'])){
            $data['description'] = '';
        }
        $name = $data['name'];
        $desc = $data['description'];
        return json_encode([$name,$desc]);
    }
    static public function get(string $dataTypeName,int $type,$data){
        if(!self::$methods_info){
            self::$methods_info = [];
            $methods = get_class_methods(self::class);
            foreach($methods as $methodName){
                $props = explode('_',$methodName);
                if(count($props) != 3){
                    continue;
                }
                [$name,,$id] = $props;
                if(!isset(self::$methods_info[$name])){
                    self::$methods_info[$name] = [];
                }
                self::$methods_info[$name][intval($id)] = $methodName;
            }
        }
        if(!isset(self::$methods_info[$dataTypeName])){
            throw new Error("$dataTypeName not exist");
        }
        if(!isset(self::$methods_info[$dataTypeName][$type])){
            throw new Error("type $type from $dataTypeName not exist");
        }
        return [self::class,self::$methods_info[$dataTypeName][$type]]($data);
    }
    static public function putModifyInResolver(DbResolver $resolver,string $dataTypeName){
        return $resolver->modify('data',function($data,$all) use ($dataTypeName){
            return DataTypesToDb::get($dataTypeName,$all['type'],$data);
        });
    }
}