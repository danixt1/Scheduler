<?php
namespace App\Http\DataType;
use App\Http\Controllers\DbResolver;
// On Adding new data transform to DB follow this rule in function name: <data_name>_<type_name>_<type_id>
// This rule is used by the get method to run the function.
class DataTypesToDb{
    use DataTypeTrait;
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
    protected static function setValueInInfo(string $methodName, string $name, int $id): mixed{
        return $methodName;
    }
    static public function get(string $dataTypeName,int $type,$data){
        self::runGet();
        self::verify($dataTypeName,$type);
        return [self::class,self::$methods_info[$dataTypeName][$type]]($data);
    }
    static public function putModifyInResolver(DbResolver $resolver,string $dataTypeName){
        return $resolver->modify('data',function($data,$all) use ($dataTypeName){
            return DataTypesToDb::get($dataTypeName,$all['type'],$data);
        });
    }
}