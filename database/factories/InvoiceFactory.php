<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition()
    {
        // Get a random existing purchase order
        $purchaseOrder = PurchaseOrder::inRandomOrder()->first();

        if (!$purchaseOrder) {
            // If no purchase orders exist, create one
            $purchaseOrder = PurchaseOrder::factory()->create();
        }

        $invoiceDate = $this->faker->dateTimeBetween('-6 months', 'now');
        $receivedDate = $this->faker->dateTimeBetween($invoiceDate, '+1 week');
        $dueDate = $this->faker->dateTimeBetween($receivedDate, '+1 month');

        $invoiceAmount = $this->faker->randomFloat(2, 1000, 500000);
        $taxAmount = $invoiceAmount * 0.12; // Assuming 12% tax
        $discountAmount = $this->faker->boolean(30) ? $this->faker->randomFloat(2, 100, 5000) : 0;
        $netAmount = $invoiceAmount + $taxAmount - $discountAmount;

        $paymentTypes = ['cash', 'check', 'bank_transfer', 'credit_card', 'other'];
        $submittedTos = ['Accounting Department', 'Finance Manager', 'CFO Office', 'Procurement Department'];
        $statuses = ['received', 'in_progress', 'approved', 'rejected', 'paid', 'overdue'];

        return [
            'si_number' => 'SI-' . now()->year . '-' . str_pad($this->faker->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'si_date' => $invoiceDate,
            'si_received_at' => $receivedDate,
            'payment_type' => $this->faker->randomElement($paymentTypes),
            'invoice_amount' => $invoiceAmount,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'net_amount' => $netAmount,
            'invoice_status' => $this->faker->randomElement($statuses),
            'due_date' => $dueDate,
            'notes' => $this->faker->boolean(70) ? $this->faker->sentence(10) : null,
            'submitted_at' => $this->faker->dateTimeBetween($receivedDate, '+1 week'),
            'submitted_to' => $this->faker->randomElement($submittedTos),
            'purchase_order_id' => $purchaseOrder->id,
            'created_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    // State methods for different statuses
    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'invoice_status' => 'pending',
            ];
        });
    }

    public function approved()
    {
        return $this->state(function (array $attributes) {
            return [
                'invoice_status' => 'approved',
            ];
        });
    }

    public function processing()
    {
        return $this->state(function (array $attributes) {
            return [
                'invoice_status' => 'processing',
            ];
        });
    }

    public function rejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'invoice_status' => 'rejected',
            ];
        });
    }

    // State method for overdue invoices
    public function overdue()
    {
        return $this->state(function (array $attributes) {
            return [
                'due_date' => $this->faker->dateTimeBetween('-1 month', '-1 day'),
                'invoice_status' => $this->faker->randomElement(['pending', 'processing']),
            ];
        });
    }

    // State method for direct invoices (with project)
    public function direct()
    {
        $vendor = \App\Models\Vendor::inRandomOrder()->first()
            ?? \App\Models\Vendor::factory()->create();
        $project = \App\Models\Project::inRandomOrder()->first()
            ?? \App\Models\Project::factory()->create();

        return $this->state(function (array $attributes) use ($vendor, $project) {
            return [
                'invoice_type' => 'direct',
                'purchase_order_id' => null,
                'vendor_id' => $vendor->id,
                'project_id' => $project->id,
            ];
        });
    }

    // State method for direct invoices WITHOUT project
    public function directWithoutProject()
    {
        $vendor = \App\Models\Vendor::inRandomOrder()->first()
            ?? \App\Models\Vendor::factory()->create();

        return $this->state(function (array $attributes) use ($vendor) {
            return [
                'invoice_type' => 'direct',
                'purchase_order_id' => null,
                'vendor_id' => $vendor->id,
                'project_id' => null,
            ];
        });
    }
}
