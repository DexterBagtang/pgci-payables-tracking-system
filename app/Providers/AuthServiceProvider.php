<?php

namespace App\Providers;

use App\Models\CheckRequisition;
use App\Models\Disbursement;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Policies\CheckRequisitionPolicy;
use App\Policies\DisbursementPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\PurchaseOrderPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

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
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Additional gates can be defined here if needed
        // Example:
        // Gate::define('admin-only', function (User $user) {
        //     return $user->isAdmin();
        // });
    }
}
