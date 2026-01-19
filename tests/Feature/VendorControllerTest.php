<?php

use App\Models\User;
use App\Models\Vendor;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Index Tests
|--------------------------------------------------------------------------
*/

it('displays vendor index page for authorized users', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();

    $response = $this->actingAs($user)->get('/vendors');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('vendors/index'));
});

it('returns paginated vendors with stats', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    Vendor::factory()->count(20)->create();

    $response = $this->actingAs($user)->get('/vendors');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->has('vendors.data')
        ->has('stats')
        ->has('filters')
    );
});

it('filters vendors by search term', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    Vendor::factory()->create(['name' => 'ABC COMPANY']);
    Vendor::factory()->create(['name' => 'XYZ CORPORATION']);

    $response = $this->actingAs($user)->get('/vendors?search=ABC');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('vendors.data.0.name', 'ABC COMPANY')
        ->where('vendors.total', 1)
    );
});

it('filters vendors by category', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    Vendor::factory()->create(['category' => 'SAP']);
    Vendor::factory()->create(['category' => 'Manual']);

    $response = $this->actingAs($user)->get('/vendors?category=SAP');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('vendors.total', 1)
    );
});

it('filters vendors by status', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    Vendor::factory()->create(['is_active' => true]);
    Vendor::factory()->create(['is_active' => false]);

    $response = $this->actingAs($user)->get('/vendors?status=1');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('vendors.total', 1)
    );
});

it('sorts vendors by name', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    Vendor::factory()->create(['name' => 'ZEBRA INC']);
    Vendor::factory()->create(['name' => 'ALPHA CORP']);

    $response = $this->actingAs($user)->get('/vendors?sort_field=name&sort_direction=asc');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('vendors.data.0.name', 'ALPHA CORP')
    );
});

/*
|--------------------------------------------------------------------------
| Show Tests
|--------------------------------------------------------------------------
*/

it('displays vendor show page for authorized users', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    $vendor = Vendor::factory()->create();

    $response = $this->actingAs($user)->get("/vendors/{$vendor->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('vendors/show')
        ->has('vendor')
    );
});

it('returns vendor with financial summary', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    $vendor = Vendor::factory()->create();

    $response = $this->actingAs($user)->get("/vendors/{$vendor->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->has('vendor.financial_summary')
    );
});

/*
|--------------------------------------------------------------------------
| Store Tests
|--------------------------------------------------------------------------
*/

it('creates a vendor with valid data', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

    $response = $this->actingAs($user)->post('/vendors', [
        'name' => 'NEW TEST VENDOR',
        'email' => 'vendor@test.com',
        'phone' => '+639123456789',
        'address' => '123 Test Street',
        'category' => 'SAP',
        'payment_terms' => 'Net 30',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('vendors', [
        'name' => 'NEW TEST VENDOR',
        'email' => 'vendor@test.com',
        'category' => 'SAP',
    ]);
});

it('validates required fields when creating vendor', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

    $response = $this->actingAs($user)->post('/vendors', [
        'name' => '',
        'category' => '',
    ]);

    $response->assertSessionHasErrors(['name', 'category']);
});

it('validates unique vendor name', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
    Vendor::factory()->create(['name' => 'EXISTING VENDOR']);

    $response = $this->actingAs($user)->post('/vendors', [
        'name' => 'EXISTING VENDOR',
        'category' => 'SAP',
    ]);

    $response->assertSessionHasErrors('name');
});

it('validates category must be SAP or Manual', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

    $response = $this->actingAs($user)->post('/vendors', [
        'name' => 'TEST VENDOR',
        'category' => 'Invalid',
    ]);

    $response->assertSessionHasErrors('category');
});

it('validates email format', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

    $response = $this->actingAs($user)->post('/vendors', [
        'name' => 'TEST VENDOR',
        'category' => 'SAP',
        'email' => 'invalid-email',
    ]);

    $response->assertSessionHasErrors('email');
});

/*
|--------------------------------------------------------------------------
| Update Tests
|--------------------------------------------------------------------------
*/

it('updates a vendor with valid data', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
    $vendor = Vendor::factory()->create(['name' => 'OLD NAME']);

    $response = $this->actingAs($user)->patch("/vendors/{$vendor->id}", [
        'name' => 'UPDATED NAME',
        'category' => 'Manual',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('vendors', [
        'id' => $vendor->id,
        'name' => 'UPDATED NAME',
        'category' => 'Manual',
    ]);
});

it('can deactivate a vendor', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
    $vendor = Vendor::factory()->create(['is_active' => true]);

    $response = $this->actingAs($user)->patch("/vendors/{$vendor->id}", [
        'name' => $vendor->name,
        'category' => $vendor->category,
        'is_active' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vendors', [
        'id' => $vendor->id,
        'is_active' => false,
    ]);
});

it('validates unique name on update excludes current vendor', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
    $vendor1 = Vendor::factory()->create(['name' => 'VENDOR ONE']);
    $vendor2 = Vendor::factory()->create(['name' => 'VENDOR TWO']);

    // Updating vendor2 with vendor1's name should fail
    $response = $this->actingAs($user)->patch("/vendors/{$vendor2->id}", [
        'name' => 'VENDOR ONE',
        'category' => $vendor2->category,
    ]);

    $response->assertSessionHasErrors('name');

    // Updating vendor1 with same name should succeed
    $response = $this->actingAs($user)->patch("/vendors/{$vendor1->id}", [
        'name' => 'VENDOR ONE',
        'category' => $vendor1->category,
    ]);

    $response->assertSessionDoesntHaveErrors('name');
});

/*
|--------------------------------------------------------------------------
| Bulk Operations Tests
|--------------------------------------------------------------------------
*/

it('bulk activates vendors', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
    $vendors = Vendor::factory()->count(3)->create(['is_active' => false]);

    $response = $this->actingAs($user)->post('/vendors/bulk-activate', [
        'vendor_ids' => $vendors->pluck('id')->toArray(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    foreach ($vendors as $vendor) {
        $this->assertDatabaseHas('vendors', [
            'id' => $vendor->id,
            'is_active' => true,
        ]);
    }
});

it('bulk deactivates vendors', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
    $vendors = Vendor::factory()->count(3)->create(['is_active' => true]);

    $response = $this->actingAs($user)->post('/vendors/bulk-deactivate', [
        'vendor_ids' => $vendors->pluck('id')->toArray(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    foreach ($vendors as $vendor) {
        $this->assertDatabaseHas('vendors', [
            'id' => $vendor->id,
            'is_active' => false,
        ]);
    }
});

it('bulk deletes vendors', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();
    $vendors = Vendor::factory()->count(3)->create();

    $response = $this->actingAs($user)->post('/vendors/bulk-delete', [
        'vendor_ids' => $vendors->pluck('id')->toArray(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    foreach ($vendors as $vendor) {
        $this->assertDatabaseMissing('vendors', ['id' => $vendor->id]);
    }
});

it('validates vendor_ids required for bulk operations', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

    $response = $this->actingAs($user)->post('/vendors/bulk-activate', [
        'vendor_ids' => [],
    ]);

    $response->assertSessionHasErrors('vendor_ids');
});

it('validates vendor_ids exist for bulk operations', function () {
    $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

    $response = $this->actingAs($user)->post('/vendors/bulk-delete', [
        'vendor_ids' => [99999, 99998],
    ]);

    $response->assertSessionHasErrors('vendor_ids.0');
});

/*
|--------------------------------------------------------------------------
| Authorization Tests
|--------------------------------------------------------------------------
*/

it('denies access to index for unauthorized users', function () {
    $user = User::factory()->withPermissions([], [])->create();

    $response = $this->actingAs($user)->get('/vendors');

    $response->assertForbidden();
});

it('denies create for users without write permission', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();

    $response = $this->actingAs($user)->post('/vendors', [
        'name' => 'TEST VENDOR',
        'category' => 'SAP',
    ]);

    $response->assertForbidden();
});

it('denies update for users without write permission', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    $vendor = Vendor::factory()->create();

    $response = $this->actingAs($user)->patch("/vendors/{$vendor->id}", [
        'name' => 'UPDATED',
        'category' => 'SAP',
    ]);

    $response->assertForbidden();
});

it('denies bulk operations for users without write permission', function () {
    $user = User::factory()->withPermissions(['vendors'], [])->create();
    $vendor = Vendor::factory()->create();

    $response = $this->actingAs($user)->post('/vendors/bulk-activate', [
        'vendor_ids' => [$vendor->id],
    ]);

    $response->assertForbidden();
});

it('allows admin to access all vendor operations', function () {
    $admin = User::factory()->admin()->create(['permissions' => null]);
    $vendor = Vendor::factory()->create();

    // Index
    $this->actingAs($admin)->get('/vendors')->assertSuccessful();

    // Show
    $this->actingAs($admin)->get("/vendors/{$vendor->id}")->assertSuccessful();

    // Store
    $this->actingAs($admin)->post('/vendors', [
        'name' => 'ADMIN VENDOR',
        'category' => 'SAP',
    ])->assertRedirect();

    // Update
    $this->actingAs($admin)->patch("/vendors/{$vendor->id}", [
        'name' => 'ADMIN UPDATED',
        'category' => 'Manual',
    ])->assertRedirect();
});

/*
|--------------------------------------------------------------------------
| Unauthenticated Access Tests
|--------------------------------------------------------------------------
*/

it('redirects unauthenticated users to login', function () {
    $this->get('/vendors')->assertRedirect('/login');
    $this->post('/vendors')->assertRedirect('/login');
});
