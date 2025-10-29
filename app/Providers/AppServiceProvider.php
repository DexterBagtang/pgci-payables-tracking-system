<?php

namespace App\Providers;

use App\Models\Vendor;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Invoice;
use App\Models\CheckRequisition;
use App\Models\File;
use App\Models\User;
use App\Models\Remark;
use App\Observers\VendorObserver;
use App\Observers\ProjectObserver;
use App\Observers\PurchaseOrderObserver;
use App\Observers\InvoiceObserver;
use App\Observers\CheckRequisitionObserver;
use App\Observers\FileObserver;
use App\Observers\UserObserver;
use App\Observers\RemarkObserver;
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
        File::observe(FileObserver::class);
        User::observe(UserObserver::class);
        Remark::observe(RemarkObserver::class);
    }
}
