<?php

namespace App\Providers;

use App\Models\Vendor;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Invoice;
use App\Models\CheckRequisition;
use App\Models\Disbursement;
use App\Models\File;
use App\Models\User;
use App\Models\Remark;
use App\Observers\VendorObserver;
use App\Observers\ProjectObserver;
use App\Observers\PurchaseOrderObserver;
use App\Observers\InvoiceObserver;
use App\Observers\CheckRequisitionObserver;
use App\Observers\DisbursementObserver;
use App\Observers\FileObserver;
use App\Observers\UserObserver;
use App\Observers\RemarkObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vendor::observe(VendorObserver::class);
        Project::observe(ProjectObserver::class);
        PurchaseOrder::observe(PurchaseOrderObserver::class);
        Invoice::observe(InvoiceObserver::class);
        CheckRequisition::observe(CheckRequisitionObserver::class);
        Disbursement::observe(DisbursementObserver::class);
        File::observe(FileObserver::class);
        User::observe(UserObserver::class);
        Remark::observe(RemarkObserver::class);

        // Define dynamic gates for each module
        foreach (User::MODULES as $module) {
            Gate::define("read-{$module}", fn(User $user) => $user->canRead($module));
            Gate::define("write-{$module}", fn(User $user) => $user->canWrite($module));
        }
    }
}
