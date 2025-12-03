<?php

use App\Models\Invoice;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create test user, vendor, project, and purchase order using factories
    $this->user = User::factory()->create();
    $this->vendor = Vendor::factory()->create();
    $this->project = Project::factory()->create();
    $this->po = PurchaseOrder::factory()->create([
        'project_id' => $this->project->id,
        'vendor_id' => $this->vendor->id,
        'po_status' => 'open',
    ]);
});

test('returns false when no invoices exist', function () {
    expect($this->po->allInvoicesPaid())->toBeFalse();
});

test('returns false when only rejected invoices exist', function () {
    Invoice::factory()->count(2)->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'rejected',
    ]);

    expect($this->po->allInvoicesPaid())->toBeFalse();
});

test('returns false when some invoices are pending', function () {
    Invoice::factory()->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'paid',
    ]);

    Invoice::factory()->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'approved',
    ]);

    expect($this->po->allInvoicesPaid())->toBeFalse();
});

test('returns true when all invoices are paid', function () {
    Invoice::factory()->count(2)->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'paid',
    ]);

    expect($this->po->allInvoicesPaid())->toBeTrue();
});

test('returns true when all non-rejected invoices are paid', function () {
    // This is the key fix - rejected invoices should not prevent PO closure
    Invoice::factory()->count(2)->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'paid',
    ]);

    Invoice::factory()->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'rejected',
    ]);

    expect($this->po->allInvoicesPaid())->toBeTrue();
});

test('returns false when mix of paid, rejected, and pending invoices exist', function () {
    Invoice::factory()->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'paid',
    ]);

    Invoice::factory()->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'rejected',
    ]);

    Invoice::factory()->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'pending_disbursement',
    ]);

    expect($this->po->allInvoicesPaid())->toBeFalse();
});

test('returns false when invoice is in pending_disbursement status', function () {
    Invoice::factory()->create([
        'purchase_order_id' => $this->po->id,
        'invoice_status' => 'pending_disbursement',
    ]);

    expect($this->po->allInvoicesPaid())->toBeFalse();
});
