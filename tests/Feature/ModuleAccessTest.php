<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Invoice;
use App\Models\CheckRequisition;
use App\Models\Disbursement;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ModuleAccessTest extends TestCase
{
    use RefreshDatabase;

    // ============================================================
    // VENDORS MODULE TESTS
    // ============================================================

    public function test_user_with_read_permission_can_view_vendor_index(): void
    {
        $user = User::factory()->withPermissions(['vendors'], [])->create();

        $response = $this->actingAs($user)->get('/vendors');

        $response->assertStatus(200);
    }

    public function test_user_without_read_permission_cannot_view_vendor_index(): void
    {
        $user = User::factory()->withPermissions([], [])->create();

        $response = $this->actingAs($user)->get('/vendors');

        $response->assertStatus(403);
    }

    public function test_user_with_write_permission_can_create_vendor(): void
    {
        $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

        $response = $this->actingAs($user)->post('/vendors', [
            'name' => 'Test Vendor',
            'email' => 'test@example.com',
            'category' => 'Manual',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('vendors', ['name' => 'Test Vendor']);
    }

    public function test_user_without_write_permission_cannot_create_vendor(): void
    {
        $user = User::factory()->withPermissions(['vendors'], [])->create();

        $response = $this->actingAs($user)->post('/vendors', [
            'name' => 'Test Vendor',
            'email' => 'test@example.com',
            'category' => 'Manual',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('vendors', ['name' => 'Test Vendor']);
    }

    public function test_user_with_write_permission_can_update_vendor(): void
    {
        $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
        $vendor = Vendor::factory()->create(['name' => 'Original Name']);

        $response = $this->actingAs($user)->post("/vendors/{$vendor->id}", [
            'name' => 'Updated Name',
            'email' => $vendor->email,
            'category' => $vendor->category,
            'is_active' => $vendor->is_active,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('vendors', ['id' => $vendor->id, 'name' => 'Updated Name']);
    }

    public function test_user_without_write_permission_cannot_update_vendor(): void
    {
        $user = User::factory()->withPermissions(['vendors'], [])->create();
        $vendor = Vendor::factory()->create(['name' => 'Original Name']);

        $response = $this->actingAs($user)->post("/vendors/{$vendor->id}", [
            'name' => 'Updated Name',
            'email' => $vendor->email,
            'category' => $vendor->category,
            'is_active' => $vendor->is_active,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('vendors', ['id' => $vendor->id, 'name' => 'Original Name']);
    }

    public function test_user_with_read_permission_can_view_vendor_show(): void
    {
        $user = User::factory()->withPermissions(['vendors'], [])->create();
        $vendor = Vendor::factory()->create();

        $response = $this->actingAs($user)->get("/vendors/{$vendor->id}");

        $response->assertStatus(200);
    }

    // ============================================================
    // PROJECTS MODULE TESTS
    // ============================================================

    public function test_user_with_read_permission_can_view_project_index(): void
    {
        $user = User::factory()->withPermissions(['projects'], [])->create();

        $response = $this->actingAs($user)->get('/projects');

        $response->assertStatus(200);
    }

    public function test_user_without_read_permission_cannot_view_project_index(): void
    {
        $user = User::factory()->withPermissions([], [])->create();

        $response = $this->actingAs($user)->get('/projects');

        $response->assertStatus(403);
    }

    public function test_user_with_write_permission_can_create_project(): void
    {
        $user = User::factory()->withPermissions(['projects'], ['projects'])->create();

        $response = $this->actingAs($user)->post('/projects', [
            'project_title' => 'Test Project',
            'cer_number' => 'CER-' . uniqid(),
            'total_project_cost' => 100000,
            'total_contract_cost' => 90000,
            'project_type' => 'sm_project',
            'project_status' => 'active',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('projects', ['project_title' => 'Test Project']);
    }

    public function test_user_without_write_permission_cannot_create_project(): void
    {
        $user = User::factory()->withPermissions(['projects'], [])->create();

        $response = $this->actingAs($user)->post('/projects', [
            'project_title' => 'Test Project',
            'cer_number' => 'CER-' . uniqid(),
        ]);

        $response->assertStatus(403);
    }

    // ============================================================
    // PURCHASE ORDERS MODULE TESTS
    // ============================================================

    public function test_user_with_read_permission_can_view_purchase_order_index(): void
    {
        $user = User::factory()->withPermissions(['purchase_orders'], [])->create();

        $response = $this->actingAs($user)->get('/purchase-orders');

        $response->assertStatus(200);
    }

    public function test_user_without_read_permission_cannot_view_purchase_order_index(): void
    {
        $user = User::factory()->withPermissions([], [])->create();

        $response = $this->actingAs($user)->get('/purchase-orders');

        $response->assertStatus(403);
    }

    // ============================================================
    // INVOICES MODULE TESTS
    // ============================================================

    public function test_user_with_read_permission_can_view_invoice_index(): void
    {
        $user = User::factory()->withPermissions(['invoices'], [])->create();

        $response = $this->actingAs($user)->get('/invoices');

        $response->assertStatus(200);
    }

    public function test_user_without_read_permission_cannot_view_invoice_index(): void
    {
        $user = User::factory()->withPermissions([], [])->create();

        $response = $this->actingAs($user)->get('/invoices');

        $response->assertStatus(403);
    }

    // ============================================================
    // CHECK REQUISITIONS MODULE TESTS
    // ============================================================

    public function test_user_with_read_permission_can_view_check_requisition_index(): void
    {
        $user = User::factory()->withPermissions(['check_requisitions'], [])->create();

        $response = $this->actingAs($user)->get('/check-requisitions');

        $response->assertStatus(200);
    }

    public function test_user_without_read_permission_cannot_view_check_requisition_index(): void
    {
        $user = User::factory()->withPermissions([], [])->create();

        $response = $this->actingAs($user)->get('/check-requisitions');

        $response->assertStatus(403);
    }

    // ============================================================
    // DISBURSEMENTS MODULE TESTS
    // ============================================================

    public function test_user_with_read_permission_can_view_disbursement_index(): void
    {
        $user = User::factory()->withPermissions(['disbursements'], [])->create();

        $response = $this->actingAs($user)->get('/disbursements');

        $response->assertStatus(200);
    }

    public function test_user_without_read_permission_cannot_view_disbursement_index(): void
    {
        $user = User::factory()->withPermissions([], [])->create();

        $response = $this->actingAs($user)->get('/disbursements');

        $response->assertStatus(403);
    }

    // ============================================================
    // ADMIN BYPASS TESTS
    // ============================================================

    public function test_admin_can_access_all_modules_without_explicit_permissions(): void
    {
        $admin = User::factory()->admin()->create(['permissions' => null]);

        $routes = [
            '/vendors',
            '/projects',
            '/purchase-orders',
            '/invoices',
            '/check-requisitions',
            '/disbursements',
        ];

        foreach ($routes as $route) {
            $response = $this->actingAs($admin)->get($route);
            $response->assertStatus(200, "Admin should access: {$route}");
        }
    }

    public function test_admin_can_write_to_all_modules_without_explicit_permissions(): void
    {
        $admin = User::factory()->admin()->create(['permissions' => null]);

        // Test vendor creation
        $response = $this->actingAs($admin)->post('/vendors', [
            'name' => 'Admin Created Vendor',
            'email' => 'admin@test.com',
            'category' => 'Manual',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('vendors', ['name' => 'Admin Created Vendor']);
    }

    // ============================================================
    // BULK OPERATIONS TESTS
    // ============================================================

    public function test_user_with_write_permission_can_bulk_delete_vendors(): void
    {
        $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
        $vendor1 = Vendor::factory()->create();
        $vendor2 = Vendor::factory()->create();

        $response = $this->actingAs($user)->post('/vendors/bulk-delete', [
            'vendor_ids' => [$vendor1->id, $vendor2->id],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('vendors', ['id' => $vendor1->id]);
        $this->assertDatabaseMissing('vendors', ['id' => $vendor2->id]);
    }

    public function test_user_without_write_permission_cannot_bulk_delete_vendors(): void
    {
        $user = User::factory()->withPermissions(['vendors'], [])->create();
        $vendor1 = Vendor::factory()->create();
        $vendor2 = Vendor::factory()->create();

        $response = $this->actingAs($user)->post('/vendors/bulk-delete', [
            'vendor_ids' => [$vendor1->id, $vendor2->id],
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('vendors', ['id' => $vendor1->id]);
        $this->assertDatabaseHas('vendors', ['id' => $vendor2->id]);
    }

    // ============================================================
    // UNAUTHENTICATED ACCESS TESTS
    // ============================================================

    public function test_unauthenticated_user_cannot_access_vendors(): void
    {
        $response = $this->get('/vendors');

        $response->assertRedirect('/login');
    }

    public function test_unauthenticated_user_cannot_access_projects(): void
    {
        $response = $this->get('/projects');

        $response->assertRedirect('/login');
    }
}