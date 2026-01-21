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
            // System Administrators
            [
                'username' => 'admin',
                'name' => 'Dexter Admin',
                'email' => 'dexterbagtang@philcom.com',
                'password' => Hash::make('asdfasdf'),
                'role' => UserRole::ADMIN,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => User::MODULES,
                    'write' => User::MODULES,
                ]
            ],
            [
                'username' => 'payables.admin',
                'name' => 'Payables Admin',
                'email' => 'payables.admin@philcom.com',
                'password' => Hash::make('payablesadmin2025'),
                'role' => UserRole::ADMIN,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => User::MODULES,
                    'write' => User::MODULES,
                ]
            ],

            // Accounting Department
            [
                'username' => 'MGU',
                'name' => 'Mike Renzo G. Ulit',
                'email' => 'Mike.Ulit@philcom.com',
                'password' => Hash::make('payables@philcom'), // Change on first login
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'JTM',
                'name' => 'Jhoy T. Mayuga',
                'email' => 'Jhoy.Mayuga@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'KAU',
                'name' => 'Kimberly A. Usona',
                'email' => 'Kimberly.Usona@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['invoices', 'invoice_review', 'check_requisitions'],
                    'write' => ['invoice_review', 'check_requisitions']
                ]
            ],
            [
                'username' => 'JLM',
                'name' => 'Joseph David L. Maderazo',
                'email' => 'Joseph.Maderazo@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['invoices', 'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],

            // Purchasing Department
            [
                'username' => 'MCZ',
                'name' => 'Marlon C. Zinampan',
                'email' => 'Marlon.Zinampan@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders'],
                    'write' => ['vendors', 'projects', 'purchase_orders']
                ]
            ],
            [
                'username' => 'AMO',
                'name' => 'Adiree Mae M. Oreo',
                'email' => 'Adiree.Morada@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders'],
                    'write' => []
                ]
            ],
            [
                'username' => 'PCD',
                'name' => 'Paulus Antonio C. DeDios',
                'email' => 'Paulus.DeDios@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', ],
                    'write' => ['purchase_orders']
                ]
            ],
            [
                'username' => 'MBA',
                'name' => 'Marymay Joy B. Alteza',
                'email' => 'Marymay.Alteza@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices'],
                    'write' => ['invoices']
                ]
            ],

            // Cash Management/Treasury Department
            [
                'username' => 'JML',
                'name' => 'Jose Bernardino M. Labay',
                'email' => 'Jose.Labay@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'NED',
                'name' => 'Nina Erica Domingo',
                'email' => 'Nina.Domingo@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['disbursements'],
                    'write' => ['disbursements']
                ]
            ],
            [
                'username' => 'MPR',
                'name' => 'Margie Loraine P. Roset',
                'email' => 'Margie.Roset@philcom.com',
                'password' => Hash::make('payables@philcom'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['disbursements'],
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
