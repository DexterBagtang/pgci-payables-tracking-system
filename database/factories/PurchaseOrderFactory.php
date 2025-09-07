<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Vendor;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseOrderFactory extends Factory
{
    protected $model = PurchaseOrder::class;

    public function definition(): array
    {
        // Random status for seeding
        $status = $this->faker->randomElement(['draft', 'open', 'closed']);

        // Finalized fields should only be filled if status is not draft
        $finalizedBy = null;
        $finalizedAt = null;
        if ($status !== 'draft') {
            $finalizedBy = 1;
            $finalizedAt = now()->subDays(rand(1, 30));
        }

        return [
            'po_number' => strtoupper($this->faker->bothify('#####')),
            'project_id' => Project::inRandomOrder()->first()->id,
            'vendor_id' => Vendor::inRandomOrder()->first()->id,
            'po_amount' => $this->faker->randomFloat(2, 1000, 50000),
            'po_status' => $status,
            'payment_term' => $this->faker->randomElement(['Net 30', 'Net 60', 'COD', null]),
            'po_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'expected_delivery_date' => $this->faker->optional()->dateTimeBetween('now', '+2 months'),
            'description' => $this->faker->sentence(),
            'created_by' => 1,
            'finalized_by' => $finalizedBy,
            'finalized_at' => $finalizedAt,
        ];
    }
}
