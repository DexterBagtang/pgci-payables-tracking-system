<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Randomly choose project type
        $projectType = $this->faker->randomElement(['sm_project', 'philcom_project']);

        // Base attributes
        $attributes = [
            'project_title' => $this->faker->words(3, true) . ' Project',
            'cer_number' => 'CER-' . $this->faker->unique()->numberBetween(1000, 9999),
            'total_project_cost' => $this->faker->randomFloat(2, 1000, 1000000),
            'total_contract_cost' => $this->faker->randomFloat(2, 800, 950000),
            'project_status' => $this->faker->randomElement(['active', 'on_hold', 'completed', 'cancelled']),
            'description' => $this->faker->paragraphs(2, true),
            'created_by' => 1,
            'project_type' => $projectType,
        ];

        // Conditionally add fields based on project type
        if ($projectType === 'sm_project') {
            $attributes['smpo_number'] = 'SMPO-' . $this->faker->unique()->numberBetween(100, 999);
            $attributes['philcom_category'] = null;
        } else {
            $attributes['smpo_number'] = null;
            $attributes['philcom_category'] = $this->faker->randomElement(['profit_and_loss', 'capital_expenditure', 'others']);
        }

        return $attributes;
    }
}
