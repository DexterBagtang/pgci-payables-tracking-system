<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_read_module_with_permission(): void
    {
        $user = User::factory()->withPermissions(['vendors'], [])->create();

        $this->assertTrue($user->canRead('vendors'));
    }

    public function test_user_cannot_read_module_without_permission(): void
    {
        $user = User::factory()->payables()->withPermissions([], [])->create();

        $this->assertFalse($user->canRead('vendors'));
    }

    public function test_user_can_write_module_with_permission(): void
    {
        $user = User::factory()->withPermissions(['vendors'], ['vendors'])->create();

        $this->assertTrue($user->canWrite('vendors'));
    }

    public function test_user_cannot_write_module_without_permission(): void
    {
        $user = User::factory()->payables()->withPermissions(['vendors'], [])->create();

        $this->assertFalse($user->canWrite('vendors'));
    }

    public function test_user_with_null_permissions_cannot_access_modules(): void
    {
        $user = User::factory()->payables()->create(['permissions' => null]);

        $this->assertFalse($user->canRead('vendors'));
        $this->assertFalse($user->canWrite('vendors'));
    }

    public function test_user_with_empty_permissions_array_cannot_access_modules(): void
    {
        $user = User::factory()->payables()->withPermissions([], [])->create();

        $this->assertFalse($user->canRead('vendors'));
        $this->assertFalse($user->canWrite('vendors'));
    }

    public function test_admin_role_bypasses_permission_checks(): void
    {
        $admin = User::factory()->admin()->create([
            'permissions' => null // Even with null permissions
        ]);

        $this->assertTrue($admin->canRead('vendors'));
        $this->assertTrue($admin->canWrite('vendors'));
        $this->assertTrue($admin->canRead('invoices'));
        $this->assertTrue($admin->canWrite('disbursements'));
    }

    public function test_admin_role_bypasses_all_modules(): void
    {
        $admin = User::factory()->admin()->create(['permissions' => null]);

        foreach (User::MODULES as $module) {
            $this->assertTrue($admin->canRead($module), "Admin should read: {$module}");
            $this->assertTrue($admin->canWrite($module), "Admin should write: {$module}");
        }
    }

    public function test_permissions_mutator_validates_modules(): void
    {
        $user = User::factory()->payables()->create([
            'permissions' => [
                'read' => ['vendors', 'invalid_module', 'projects'],
                'write' => ['vendors', 'fake_module']
            ]
        ]);

        // Invalid modules should be filtered out
        $this->assertTrue($user->canRead('vendors'));
        $this->assertTrue($user->canRead('projects'));
        $this->assertFalse($user->canRead('invalid_module'));
        $this->assertFalse($user->canWrite('fake_module'));
    }

    public function test_permissions_mutator_filters_invalid_modules(): void
    {
        $user = User::factory()->create([
            'permissions' => [
                'read' => ['vendors', 'not_a_real_module', 'projects', 'also_fake'],
                'write' => ['invoices', 'totally_made_up']
            ]
        ]);

        $readableModules = $user->getReadableModules();
        $writableModules = $user->getWritableModules();

        // Should only contain valid modules
        $this->assertContains('vendors', $readableModules);
        $this->assertContains('projects', $readableModules);
        $this->assertNotContains('not_a_real_module', $readableModules);
        $this->assertNotContains('also_fake', $readableModules);

        $this->assertContains('invoices', $writableModules);
        $this->assertNotContains('totally_made_up', $writableModules);
    }

    public function test_get_readable_modules_returns_correct_array(): void
    {
        $user = User::factory()->payables()->withPermissions(['vendors', 'projects'], [])->create();

        $this->assertEquals(['vendors', 'projects'], $user->getReadableModules());
    }

    public function test_get_writable_modules_returns_correct_array(): void
    {
        $user = User::factory()->payables()->withPermissions(['vendors'], ['vendors', 'projects'])->create();

        $this->assertEquals(['vendors', 'projects'], $user->getWritableModules());
    }

    public function test_admin_get_readable_modules_returns_all_modules(): void
    {
        $admin = User::factory()->admin()->create(['permissions' => null]);

        $this->assertEquals(User::MODULES, $admin->getReadableModules());
    }

    public function test_admin_get_writable_modules_returns_all_modules(): void
    {
        $admin = User::factory()->admin()->create(['permissions' => null]);

        $this->assertEquals(User::MODULES, $admin->getWritableModules());
    }

    public function test_user_can_have_read_without_write(): void
    {
        $user = User::factory()->payables()->withPermissions(['vendors', 'projects'], ['vendors'])->create();

        $this->assertTrue($user->canRead('vendors'));
        $this->assertTrue($user->canRead('projects'));
        $this->assertTrue($user->canWrite('vendors'));
        $this->assertFalse($user->canWrite('projects'));
    }

    public function test_all_module_constants_are_valid_strings(): void
    {
        foreach (User::MODULES as $module) {
            $this->assertIsString($module);
            $this->assertNotEmpty($module);
        }
    }

    public function test_module_constants_contain_expected_modules(): void
    {
        $expectedModules = [
            'vendors',
            'projects',
            'purchase_orders',
            'invoices',
            'invoice_review',
            'check_requisitions',
            'disbursements',
            'users',
        ];

        $this->assertEquals($expectedModules, User::MODULES);
    }

    public function test_with_all_permissions_factory_method(): void
    {
        $user = User::factory()->withAllPermissions()->create();

        foreach (User::MODULES as $module) {
            $this->assertTrue($user->canRead($module));
            $this->assertTrue($user->canWrite($module));
        }
    }

    public function test_non_admin_roles_respect_permissions(): void
    {
        $payablesUser = User::factory()->payables()->create(['permissions' => null]);
        $purchasingUser = User::factory()->purchasing()->create(['permissions' => null]);
        $disbursementUser = User::factory()->disbursement()->create(['permissions' => null]);

        // None should have access without explicit permissions
        $this->assertFalse($payablesUser->canRead('vendors'));
        $this->assertFalse($purchasingUser->canRead('projects'));
        $this->assertFalse($disbursementUser->canRead('disbursements'));
    }
}