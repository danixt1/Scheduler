<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = 1;//1 = HTTP Request
        /**
         * Case type is 1;
         * @type {object}
         * @prop {string} u URL
         * @prop {string} m Method
         * @prop {object} h headers
         */
        $data = [];
        $name = '';
        switch($type){
            case 1:
                $name =fake()->randomElement(['email request','SAP endpoint','message app endpoint']);
                $data = [
                    'u'=>'http://localhost:'.fake()->randomElement(['8999','8998','8951']),
                    'm'=>fake()->randomElement(['GET','POST','DELETE']),
                    'h'=>["Auth"=>"46070d4bf934fb0d4b06d9e2c46e346944e322444900a435d7d9a95e6d7435f5"]
                ];
                break;
        }
        return [
            'name'=>$name,
            'data'=>json_encode($data),
            'type'=>$type
        ];
    }
}
