<?php
namespace Tests\Events;

use App\Events\Scheduler\DbBulk;
use App\Models\EventsData;
use App\Models\Location;

class SchedulerTest extends \Tests\TestCase{
    use \Illuminate\Foundation\Testing\RefreshDatabase;
    private static function datasetInsert(){
        $hidden = ["id",'created_at','updated_at'];
        return [
            "locations"=>Location::factory(4)->make()->setHidden($hidden)->toArray(),
            "eventsdatas"=>EventsData::factory(4)->make()->setHidden($hidden)->toArray()
        ];
    }
    public function test_DbBulk_insert_single_table(){
        $table = "eventsdatas";
        $toInsert = $this->datasetInsert()[$table];
        $dbBulk =new DbBulk;
        foreach($toInsert as $valuesInRow){
            $dbBulk->insert($table,$valuesInRow);
        };
        $this->assertTrue($dbBulk->execute(),"expected to operation execute with success");
        foreach ($toInsert as $value) {
            $this->assertDatabaseHas($table,$value);
        }
    }
    public function test_dbBulk_delete_single_table(){
        $table = 'locations';
        $models =Location::factory()->count(4)->create();
        $ids = $models->modelKeys();
        $bulk = new DbBulk;
        foreach($ids as $id){
            $bulk->delete($table,$id);
        }
        $this->assertTrue($bulk->execute(),"returned false deleting rows in db expected true");
        $this->assertDatabaseEmpty($table);
    }
    public function test_dbBulk_full_test(){
        $toInsert = $this->datasetInsert();
        $dbBulk =new DbBulk;
        $toDelete = [
            "locations"=>Location::factory(4)->create()->modelKeys(),
            "eventsdatas"=>EventsData::factory(4)->create()->modelKeys()
        ];
        foreach ($toInsert as $table => $data) {
            foreach($data as $valuesInRow){
                $dbBulk->insert($table,$valuesInRow);
            };
        };
        foreach ($toDelete as $table => $data) {
            foreach($data as $id){
                $dbBulk->delete($table,$id);
            };
        };
        $this->assertTrue($dbBulk->execute());
        foreach($toInsert as $table=>$data){
            $this->assertDatabaseCount($table,count($data));
        }
    }
}