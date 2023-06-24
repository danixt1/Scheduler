<?php 
namespace App\Classes;

class Sender{

    private array $locations = [];
    private array $fallbacks = [];
    private string $name = '';
    private int $id;

    public function __construct(array $data){
        $this->id = $data['id'];
        $this->locations = $data['locations'];
        $this->fallbacks = $data['fallbacks'];
        $this->name = $data['name'];
    }
}
?>