<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            // Accounting Department
            [
                'username' => 'MGU',
                'name' => 'Mike Renzo G. Ulit',
                'email' => 'Mike.Ulit@philcom.com',
                'password' => Hash::make('password'), // Change on first login
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'JTM',
                'name' => 'Jhoy T. Mayuga',
                'email' => 'Jhoy.Mayuga@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'KAU',
                'name' => 'Kimberly A. Usona',
                'email' => 'Kimberly.Usona@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['invoice_review', 'check_requisitions']
                ]
            ],
            [
                'username' => 'JLM',
                'name' => 'Joseph David L. Maderazo',
                'email' => 'Joseph.Maderazo@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],

            // Purchasing Department
            [
                'username' => 'MCZ',
                'name' => 'Marlon C. Zinampan',
                'email' => 'Marlon.Zinampan@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['vendors', 'projects', 'purchase_orders']
                ]
            ],
            [
                'username' => 'AMO',
                'name' => 'Adiree Mae M. Oreo',
                'email' => 'Adiree.Morada@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'PCD',
                'name' => 'Paulus Antonio C. DeDios',
                'email' => 'Paulus.DeDios@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['purchase_orders']
                ]
            ],
            [
                'username' => 'MBA',
                'name' => 'Marymay Joy B. Alteza',
                'email' => 'Marymay.Alteza@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['invoices']
                ]
            ],

            // Cash Management/Treasury Department
            [
                'username' => 'JML',
                'name' => 'Jose Bernardino M. Labay',
                'email' => 'Jose.Labay@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'NED',
                'name' => 'Nina Erica Domingo',
                'email' => 'Nina.Domingo@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['disbursements']
                ]
            ],
            [
                'username' => 'MPR',
                'name' => 'Margie Loraine P. Roset',
                'email' => 'Margie.Roset@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['username' => $userData['username']],
                $userData
            );
        }

        $this->command->info('Successfully seeded ' . count($users) . ' users with permissions.');
    }
}
