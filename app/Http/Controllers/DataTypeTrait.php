<?php
namespace App\Http\Controllers;

use App\Http\DataType\DataTypesRules;
use App\Http\DataType\DataTypesToDb;
use App\Http\DataType\ExceptionTypeNotFound;
use Illuminate\Validation\Validator;
/**
 * Trait used by controller with data in pattern `data` classified by property `type`.
 * can do validation and resolve JSON to db.
 */
trait DataTypeTrait{
    /**
     * Put the rule after the validation.
     * 
     * Passing a valid Validator is added the rule is passed direct to `after()`.
     * 
     * Case not validator passed is returned the function to by applied in after.EX:
     * 
     * ```php
     * <?php
     * $validator->after([
     *  $this->validationAfterType(),
     *  function(\Illuminate\Validation\Validator $validator){
     *      //your code
     *  }
     * ]);
     * ?>
     * ```
     */
    private function validationAfterType(Validator|null $validator = null){
        $fn = function(Validator $validator){
            $data = $validator->getData();
            $rules = $validator->getRules();
            if(isset($data['data']) && !isset($rules['type'])){
                $validator->errors()->add('type','type is always required in update');
            };
        };
        if($validator){
            $validator->after($fn);
            return $validator;
        };
        return $fn;
    }
    /**
     * The first index is the 1 in the data type index.
     */
    private function addRulesByTypes(Validator $validator,$addAfterFn = false){
        $data = $validator->getData();
        $rules = $validator->getRules();
        if(isset($rules['data'])){
            try{
                $validator->addRules(DataTypesRules::get(self::dataName(),$data['type']));
            }catch (\Throwable $e){
                if(!is_a($e,ExceptionTypeNotFound::class)){
                    throw $e;
                }
                //In case fail the rules defined gonna to show it on $validator->fails()
            }
        }
        if($addAfterFn){
            $this->validationAfterType($validator);
        }
        return $validator;
    }
    /** Return the name declared in `DataTypeRules` and `DataTypesToDb` */
    abstract public static function dataName():string;
    /** In case of overriding toDb fn use this function to set the data resolver */
    public static function setDataModify(DbResolver $resolver):DbResolver{
        return DataTypesToDb::putModifyInResolver($resolver,self::dataName());
    }
    public static function toDb():DbResolver{
        return DataTypesToDb::putModifyInResolver(new DbResolver,self::dataName());
    }
}