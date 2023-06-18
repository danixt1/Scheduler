<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventsData>
 */
class EventsDataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = 1;//1 = Reminder
        $data = [];
        switch($type){
            case 1:
                $data = [
                    fake()->randomElement(["Check for ","visit site from ","check if have email from "]). fake()->company(),
                    fake()->text(100)
                ];
            break;
        }
        return [
            'type'=>$type,
            'data'=>json_encode($data)
        ];
    }
}
