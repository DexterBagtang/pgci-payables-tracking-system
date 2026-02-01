<?php

use App\Enums\UserRole;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('admin can access help index', function () {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($admin)->get(route('help.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('help/index')
        ->has('manuals')
    );
});

test('admin can see all manuals', function () {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($admin)->get(route('help.index'));

    $response->assertInertia(fn ($page) => $page
        ->component('help/index')
        ->has('manuals', 5) // All manuals visible to admin
    );
});

test('payables user can access help index', function () {
    $user = User::factory()->create(['role' => UserRole::PAYABLES]);

    $response = $this->actingAs($user)->get(route('help.index'));

    $response->assertInertia(fn ($page) => $page
        ->component('help/index')
        ->has('manuals', 5) // Index returns all manuals; access is enforced on show
    );
});

test('purchasing user can access help index', function () {
    $user = User::factory()->create(['role' => UserRole::PURCHASING]);

    $response = $this->actingAs($user)->get(route('help.index'));

    $response->assertInertia(fn ($page) => $page
        ->component('help/index')
        ->has('manuals', 5) // Index returns all manuals; access is enforced on show
    );
});

test('can view specific manual', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($user)
        ->get(route('help.show', ['slug' => 'bulk-invoice-creation']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('help/show')
        ->has('manual.content') // Contains markdown content
        ->has('manual.title')
        ->has('manual.slug')
        ->has('manuals') // Sidebar navigation
    );
});

test('cannot access manual that does not exist', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($user)
        ->get(route('help.show', ['slug' => 'non-existent-manual']));

    $response->assertNotFound();
});

test('cannot access manual with invalid slug format', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($user)
        ->get(route('help.show', ['slug' => '../../../etc/passwd']));

    $response->assertNotFound();
});

test('user without access to manual cannot view it', function () {
    $user = User::factory()->create(['role' => UserRole::PURCHASING]);

    // PURCHASING is only allowed 'management' category; core-workflows should be denied
    $response = $this->actingAs($user)
        ->get(route('help.show', ['slug' => 'bulk-invoice-creation']));

    $response->assertForbidden();
});

test('unauthenticated user cannot access help', function () {
    $response = $this->get(route('help.index'));

    $response->assertRedirect(route('login'));
});
