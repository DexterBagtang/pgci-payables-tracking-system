<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->company();
        $category = $this->faker->randomElement(['SAP', 'Manual']);
        $vendorType = $this->faker->randomElement(['supplier', 'contractor', 'service_provider', 'other']);

        return [
            'name' => $name,
//            'email' => $this->faker->optional()->safeEmail(),
//            'phone' => $this->faker->optional()->phoneNumber(),
//            'address' => $this->faker->optional()->address(),
            'category' => $category,
//            'payment_terms' => $this->faker->optional()->randomElement([
//                'Net 30', 'Net 15', 'Due on Receipt', '2% 10 Net 30'
//            ]),
            'is_active' => 1, // 90% chance of being active
            'vendor_type' => $vendorType,
            'created_by' => 1, // Assuming you have users with IDs 1–10
        ];
    }
}
