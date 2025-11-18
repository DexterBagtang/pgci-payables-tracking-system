<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Project;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Dexter Admin',
            'username' => 'admin',
            'email' => 'dexterbagtang@philcom.com',
            'role' => UserRole::ADMIN,
            'password' => Hash::make('asdfasdf'),
        ]);

        User::factory()->create([
            'name' => 'Payables Admin',
            'username' => 'payables.admin',
            'email' => 'payables.admin@philcom.com',
            'role' => UserRole::ADMIN,
            'password' => Hash::make('payablesadmin2025'),
        ]);

        // Sample users for each role
        User::factory()->create([
            'name' => 'John Purchasing',
            'username' => 'purchasing',
            'email' => 'purchasing@philcom.com',
            'role' => UserRole::PURCHASING,
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Jane Payables',
            'username' => 'payables',
            'email' => 'payables@philcom.com',
            'role' => UserRole::PAYABLES,
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Mike Disbursement',
            'username' => 'disbursement',
            'email' => 'disbursement@philcom.com',
            'role' => UserRole::DISBURSEMENT,
            'password' => Hash::make('password'),
        ]);

        $this->call([
//            VendorSeeder::class,
//            ProjectSeeder::class,
//            PurchaseOrderSeeder::class,
//            InvoiceSeeder::class,
        ]);



    }
}
