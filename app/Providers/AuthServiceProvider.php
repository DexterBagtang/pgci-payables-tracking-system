<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\CheckRequisition;
use App\Models\Disbursement;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Vendor;
use App\Policies\CheckRequisitionPolicy;
use App\Policies\DisbursementPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\PurchaseOrderPolicy;
use App\Policies\VendorPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Invoice::class => InvoicePolicy::class,
        PurchaseOrder::class => PurchaseOrderPolicy::class,
        CheckRequisition::class => CheckRequisitionPolicy::class,
        Disbursement::class => DisbursementPolicy::class,
        Vendor::class => VendorPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::define('view-manual', function (User $user, string $category) {
            if ($user->role === UserRole::ADMIN) {
                return true;
            }

            if ($category === 'core-workflows') {
                return in_array($user->role, [UserRole::PAYABLES, UserRole::DISBURSEMENT]);
            }

            if ($category === 'management') {
                return $user->role === UserRole::PURCHASING;
            }

            return false;
        });
    }
}
