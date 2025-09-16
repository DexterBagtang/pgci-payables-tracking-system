<?php

namespace Database\Seeders;

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
            'role' => 'admin',
            'password' => Hash::make('asdfasdf'),
        ]);

        User::factory()->create([
            'name' => 'Payables Admin',
            'username' => 'payables.admin',
            'email' => 'payables.admin@philcom.com',
            'role' => 'admin',
            'password' => Hash::make('payablesadmin2025'),
        ]);

        $this->call([
            VendorSeeder::class,
            ProjectSeeder::class,
//            PurchaseOrderSeeder::class,
//            InvoiceSeeder::class,
        ]);



    }
}
