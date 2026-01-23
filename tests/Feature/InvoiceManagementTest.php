<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InvoiceManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']); // Assuming admin can manage invoices
        $this->actingAs($this->user);
    }

    /** @test */
    public function an_admin_can_view_the_invoice_creation_form()
    {
        $response = $this->get(route('invoices.create'));

        $response->assertInertia(fn (Assert $page) => $page->component('invoices/create'));
    }

    /** @test */
    public function an_admin_can_create_a_single_po_based_invoice()
    {
        $purchaseOrder = PurchaseOrder::factory()->for(Vendor::factory())->create();
        $vendor = $purchaseOrder->vendor;

        $invoiceData = [
            'invoice_type' => 'purchase_order',
            'purchase_order_id' => $purchaseOrder->id,
            'si_number' => $this->faker->unique()->randomNumber(5),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PHP',
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);

        $response->assertRedirect(route('invoices.index'));
        $response->assertSessionHas('success', '1 invoice(s) created successfully!');
        $this->assertDatabaseHas('invoices', [
            'purchase_order_id' => $purchaseOrder->id,
            'si_number' => $invoiceData['si_number'],
            'invoice_type' => 'purchase_order',
            'vendor_id' => null, // Should be null for PO-based
        ]);
    }

    /** @test */
    public function an_admin_can_create_a_single_direct_invoice_with_vendor()
    {
        $vendor = Vendor::factory()->create();

        $invoiceData = [
            'invoice_type' => 'direct',
            'vendor_id' => $vendor->id,
            'si_number' => $this->faker->unique()->randomNumber(5),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PHP',
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);

        $response->assertRedirect(route('invoices.index'));
        $response->assertSessionHas('success', '1 invoice(s) created successfully!');
        $this->assertDatabaseHas('invoices', [
            'vendor_id' => $vendor->id,
            'si_number' => $invoiceData['si_number'],
            'invoice_type' => 'direct',
            'purchase_order_id' => null, // Should be null for direct
        ]);
    }

    /** @test */
    public function an_admin_can_create_multiple_po_based_invoices_in_bulk()
    {
        $purchaseOrder = PurchaseOrder::factory()->for(Vendor::factory())->create();

        $invoicesData = [
            [
                'invoice_type' => 'purchase_order',
                'purchase_order_id' => $purchaseOrder->id,
                'si_number' => $this->faker->unique()->randomNumber(5),
                'si_date' => $this->faker->date(),
                'si_received_at' => $this->faker->date(),
                'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
                'currency' => 'PHP',
                'terms_of_payment' => '30 Days',
                'submitted_to' => 'Kimberly Usona',
                'submitted_at' => $this->faker->date(),
            ],
            [
                'invoice_type' => 'purchase_order',
                'purchase_order_id' => $purchaseOrder->id,
                'si_number' => $this->faker->unique()->randomNumber(5),
                'si_date' => $this->faker->date(),
                'si_received_at' => $this->faker->date(),
                'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
                'currency' => 'PHP',
                'terms_of_payment' => '30 Days',
                'submitted_to' => 'Kimberly Usona',
                'submitted_at' => $this->faker->date(),
            ],
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => $invoicesData]);

        $response->assertRedirect(route('invoices.index'));
        $response->assertSessionHas('success', '2 invoice(s) created successfully!');
        $this->assertCount(2, Invoice::all());
        $this->assertDatabaseHas('invoices', ['si_number' => $invoicesData[0]['si_number']]);
        $this->assertDatabaseHas('invoices', ['si_number' => $invoicesData[1]['si_number']]);
    }

    /** @test */
    public function an_admin_can_create_multiple_direct_invoices_in_bulk()
    {
        $vendor = Vendor::factory()->create();

        $invoicesData = [
            [
                'invoice_type' => 'direct',
                'vendor_id' => $vendor->id,
                'si_number' => $this->faker->unique()->randomNumber(5),
                'si_date' => $this->faker->date(),
                'si_received_at' => $this->faker->date(),
                'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
                'currency' => 'PHP',
                'terms_of_payment' => '30 Days',
                'submitted_to' => 'Kimberly Usona',
                'submitted_at' => $this->faker->date(),
            ],
            [
                'invoice_type' => 'direct',
                'vendor_id' => $vendor->id,
                'si_number' => $this->faker->unique()->randomNumber(5),
                'si_date' => $this->faker->date(),
                'si_received_at' => $this->faker->date(),
                'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
                'currency' => 'PHP',
                'terms_of_payment' => '30 Days',
                'submitted_to' => 'Kimberly Usona',
                'submitted_at' => $this->faker->date(),
            ],
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => $invoicesData]);

        $response->assertRedirect(route('invoices.index'));
        $response->assertSessionHas('success', '2 invoice(s) created successfully!');
        $this->assertCount(2, Invoice::all());
        $this->assertDatabaseHas('invoices', [
            'si_number' => $invoicesData[0]['si_number'],
            'vendor_id' => $vendor->id,
            'invoice_type' => 'direct',
        ]);
        $this->assertDatabaseHas('invoices', [
            'si_number' => $invoicesData[1]['si_number'],
            'vendor_id' => $vendor->id,
            'invoice_type' => 'direct',
        ]);
    }

    // Add validation tests here for missing fields, invalid types, etc.
    /** @test */
    public function invoice_type_is_required()
    {
        $invoiceData = [
            'purchase_order_id' => PurchaseOrder::factory()->create()->id,
            'si_number' => $this->faker->unique()->randomNumber(5),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);
        $response->assertSessionHasErrors('invoices.0.invoice_type');
    }

    /** @test */
    public function purchase_order_id_is_required_for_po_based_invoices()
    {
        $invoiceData = [
            'invoice_type' => 'purchase_order',
            // 'purchase_order_id' is missing
            'si_number' => $this->faker->unique()->randomNumber(5),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);
        $response->assertSessionHasErrors('invoices.0.purchase_order_id');
    }

    /** @test */
    public function vendor_id_is_required_for_direct_invoices()
    {
        $invoiceData = [
            'invoice_type' => 'direct',
            // 'vendor_id' is missing
            'si_number' => $this->faker->unique()->randomNumber(5),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);
        $response->assertSessionHasErrors('invoices.0.vendor_id');
    }

    /** @test */
    public function cannot_have_purchase_order_id_for_direct_invoices()
    {
        $invoiceData = [
            'invoice_type' => 'direct',
            'purchase_order_id' => PurchaseOrder::factory()->create()->id, // Should not be present
            'vendor_id' => Vendor::factory()->create()->id,
            'si_number' => $this->faker->unique()->randomNumber(5),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);
        $response->assertSessionHasErrors('invoices.0.purchase_order_id');
    }

    /** @test */
    public function cannot_have_vendor_id_for_po_based_invoices()
    {
        $invoiceData = [
            'invoice_type' => 'purchase_order',
            'purchase_order_id' => PurchaseOrder::factory()->create()->id,
            'vendor_id' => Vendor::factory()->create()->id, // Should not be present
            'si_number' => $this->faker->unique()->randomNumber(5),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);
        $response->assertSessionHasErrors('invoices.0.vendor_id');
    }

    /** @test */
    public function si_number_must_be_unique_per_vendor()
    {
        $vendor = Vendor::factory()->create();
        $purchaseOrder = PurchaseOrder::factory()->for($vendor)->create();

        // Create a PO-based invoice first
        $poInvoice = Invoice::factory()->create([
            'invoice_type' => 'purchase_order',
            'purchase_order_id' => $purchaseOrder->id,
            'vendor_id' => null, // PO-based
            'si_number' => '12345',
        ]);

        // Attempt to create another PO-based invoice with same SI number for the same vendor
        $invoiceData1 = [
            'invoice_type' => 'purchase_order',
            'purchase_order_id' => $purchaseOrder->id,
            'si_number' => '12345',
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PHP',
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];
        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData1]]);
        $response->assertSessionHasErrors('invoices.0.si_number');

        // Create a direct invoice with same SI number for a different vendor
        $anotherVendor = Vendor::factory()->create();
        $invoiceData2 = [
            'invoice_type' => 'direct',
            'vendor_id' => $anotherVendor->id,
            'si_number' => '12345', // Same SI, different vendor - should pass
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PHP',
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];
        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData2]]);
        $response->assertRedirect(route('invoices.index')); // This should pass
    }

    /** @test */
    public function currency_must_match_po_currency_for_po_based_invoices()
    {
        $purchaseOrder = PurchaseOrder::factory()->for(Vendor::factory())->create(['currency' => 'USD']);

        $invoiceData = [
            'invoice_type' => 'purchase_order',
            'purchase_order_id' => $purchaseOrder->id,
            'si_number' => $this->faker->unique()->randomNumber(5),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PHP', // Mismatch
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);
        $response->assertSessionHasErrors('invoices.0.currency');

        // Should pass with matching currency
        $invoiceData['currency'] = 'USD';
        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);
        $response->assertRedirect(route('invoices.index'));
    }

    /** @test */
    public function direct_invoice_with_project_can_be_created()
    {
        $vendor = Vendor::factory()->create();
        $project = \App\Models\Project::factory()->create();

        $invoiceData = [
            'invoice_type' => 'direct',
            'vendor_id' => $vendor->id,
            'project_id' => $project->id,
            'si_number' => $this->faker->unique()->randomNumber(5),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PHP',
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);

        $response->assertRedirect(route('invoices.index'));
        $this->assertDatabaseHas('invoices', [
            'vendor_id' => $vendor->id,
            'project_id' => $project->id,
            'invoice_type' => 'direct',
            'purchase_order_id' => null,
        ]);
    }

    /** @test */
    public function direct_invoice_without_project_can_be_created()
    {
        $vendor = Vendor::factory()->create();

        $invoiceData = [
            'invoice_type' => 'direct',
            'vendor_id' => $vendor->id,
            'project_id' => null, // No project
            'si_number' => $this->faker->unique()->randomNumber(5),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'PHP',
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);

        $response->assertRedirect(route('invoices.index'));
        $this->assertDatabaseHas('invoices', [
            'vendor_id' => $vendor->id,
            'project_id' => null,
            'invoice_type' => 'direct',
            'purchase_order_id' => null,
        ]);
    }

    /** @test */
    public function direct_invoice_currency_can_differ_from_vendor_default()
    {
        $vendor = Vendor::factory()->create();

        // Direct invoices can use any currency (not restricted like PO invoices)
        $invoiceData = [
            'invoice_type' => 'direct',
            'vendor_id' => $vendor->id,
            'si_number' => $this->faker->unique()->randomNumber(5),
            'si_date' => $this->faker->date(),
            'si_received_at' => $this->faker->date(),
            'invoice_amount' => $this->faker->randomFloat(2, 100, 1000),
            'currency' => 'USD', // Can be USD even if vendor default is PHP
            'terms_of_payment' => '30 Days',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $this->faker->date(),
        ];

        $response = $this->post(route('invoices.store'), ['invoices' => [$invoiceData]]);

        $response->assertRedirect(route('invoices.index'));
        $this->assertDatabaseHas('invoices', [
            'vendor_id' => $vendor->id,
            'currency' => 'USD',
            'invoice_type' => 'direct',
        ]);
    }

    /** @test */
    public function an_admin_can_edit_direct_invoice()
    {
        $vendor = Vendor::factory()->create();
        $invoice = Invoice::factory()->create([
            'invoice_type' => 'direct',
            'vendor_id' => $vendor->id,
            'project_id' => null,
            'purchase_order_id' => null,
        ]);

        $newVendor = Vendor::factory()->create();
        $updateData = [
            'invoice_type' => 'direct',
            'vendor_id' => $newVendor->id,
            'si_number' => $invoice->si_number,
            'si_date' => $invoice->si_date,
            'si_received_at' => $invoice->si_received_at,
            'invoice_amount' => 2500.00,
            'currency' => 'PHP',
            'terms_of_payment' => 'Final Payment',
            'submitted_to' => 'Kimberly Usona',
            'submitted_at' => $invoice->submitted_at,
        ];

        $response = $this->post(route('invoices.update', $invoice), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'vendor_id' => $newVendor->id,
            'invoice_amount' => 2500.00,
        ]);
    }
}
