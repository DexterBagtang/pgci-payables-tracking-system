<?php

use App\Http\Controllers\CheckRequisitionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Dashboard\PurchasingWidgetController;
use App\Http\Controllers\Dashboard\PayablesWidgetController;
use App\Http\Controllers\Dashboard\DisbursementWidgetController;
use App\Http\Controllers\DisbursementController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\RemarksController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified'])->group(function () {
//    Route::get('/', function () {
//        return Inertia::render('dashboard');
////        return Inertia::render('welcome');
//    })->name('home');

    Route::get('/', [DashboardController::class,'index'])->name('home');
    Route::get('/dashboard', [DashboardController::class,'index'])->name('dashboard');

    // Dashboard Widget API Routes
    Route::prefix('api/dashboard')->group(function () {
        // Purchasing Widgets
        Route::prefix('purchasing')->group(function () {
            Route::get('financial-commitments', [PurchasingWidgetController::class, 'financialCommitments']);
            Route::get('vendor-performance', [PurchasingWidgetController::class, 'vendorPerformance']);
            Route::get('po-status-summary', [PurchasingWidgetController::class, 'poStatusSummary']);
            Route::get('currency-summary', [PurchasingWidgetController::class, 'currencySummary']);
            Route::get('recent-invoices', [PurchasingWidgetController::class, 'recentInvoices']);
            // New widget endpoints
            Route::get('actionable-items', [PurchasingWidgetController::class, 'actionableItems']);
            Route::get('po-status-overview', [PurchasingWidgetController::class, 'poStatusOverview']);
            Route::get('invoice-status-tracking', [PurchasingWidgetController::class, 'invoiceStatusTracking']);
            Route::get('vendor-metrics', [PurchasingWidgetController::class, 'vendorMetrics']);
            Route::get('project-metrics', [PurchasingWidgetController::class, 'projectMetrics']);
            Route::get('activity-timeline', [PurchasingWidgetController::class, 'activityTimeline']);
        });

        // Payables Widgets
        Route::prefix('payables')->group(function () {
            Route::get('financial-metrics', [PayablesWidgetController::class, 'financialMetrics']);
            Route::get('invoice-review-queue', [PayablesWidgetController::class, 'invoiceReviewQueue']);
            Route::get('cr-approval-queue', [PayablesWidgetController::class, 'crApprovalQueue']);
            Route::get('invoice-aging', [PayablesWidgetController::class, 'invoiceAging']);
            Route::get('payment-schedule', [PayablesWidgetController::class, 'paymentSchedule']);
            // New widget endpoints
            Route::get('actionable-items', [PayablesWidgetController::class, 'actionableItems']);
            Route::get('invoice-status-pipeline', [PayablesWidgetController::class, 'invoiceStatusPipeline']);
            Route::get('activity-timeline', [PayablesWidgetController::class, 'activityTimeline']);
        });

        // Disbursement Widgets
        Route::prefix('disbursement')->group(function () {
            Route::get('financial-metrics', [DisbursementWidgetController::class, 'financialMetrics']);
            Route::get('printing-queue', [DisbursementWidgetController::class, 'printingQueue']);
            Route::get('pending-releases', [DisbursementWidgetController::class, 'pendingReleases']);
            Route::get('check-schedule', [DisbursementWidgetController::class, 'checkSchedule']);
            Route::get('check-aging', [DisbursementWidgetController::class, 'checkAging']);
            // New widget endpoints
            Route::get('actionable-items', [DisbursementWidgetController::class, 'actionableItems']);
            Route::get('check-status-pipeline', [DisbursementWidgetController::class, 'checkStatusPipeline']);
            Route::get('activity-timeline', [DisbursementWidgetController::class, 'activityTimeline']);
        });
    });

    Route::resource('vendors', VendorController::class);
    Route::post('vendors/bulk-activate', [VendorController::class, 'bulkActivate'])->name('vendors.bulk-activate');
    Route::post('vendors/bulk-deactivate', [VendorController::class, 'bulkDeactivate'])->name('vendors.bulk-deactivate');
    Route::post('vendors/bulk-delete', [VendorController::class, 'bulkDelete'])->name('vendors.bulk-delete');
    Route::resource('projects', ProjectController::class);
    Route::resource('purchase-orders', PurchaseOrderController::class)->except(['update']);
    Route::post('purchase-orders/{purchase_order}', [PurchaseOrderController::class, 'update'])
        ->name('purchase-orders.update');
    Route::post('purchase-orders/{purchase_order}/close', [PurchaseOrderController::class, 'close'])
        ->name('purchase-orders.close');

    Route::resource('invoices', InvoiceController::class)->except(['update']);
    Route::post('invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::post('invoices/{invoice}/review', [InvoiceController::class, 'review'])->name('invoices.review');
    Route::get('/invoice/bulk-review', [InvoiceController::class, 'bulkReview'])->name('invoices.bulk-review');
    Route::get('/api/invoice/bulk-review', [InvoiceController::class, 'bulkReviewApi'])->name('invoices.bulk-review-api');

    Route::post('/invoice/bulk-mark-received', [InvoiceController::class, 'bulkMarkReceived'])->name('invoices.bulk-mark-received');
    Route::post('/invoice/bulk-approve', [InvoiceController::class, 'bulkApprove'])->name('invoices.bulk-approve');
    Route::post('/invoice/bulk-reject', [InvoiceController::class, 'bulkReject'])->name('invoices.bulk-reject');


    Route::resource('check-requisitions', CheckRequisitionController::class);
    // API endpoint for check requisition creation with pagination
    Route::get('/api/check-requisitions/create', [CheckRequisitionController::class, 'createApi'])
        ->name('check-requisitions.create-api');
    // API endpoint for check requisition editing with pagination
    Route::get('/api/check-requisitions/{checkRequisition}/edit', [CheckRequisitionController::class, 'editApi'])
        ->name('check-requisitions.edit-api');
    // Review and approval routes
    Route::get('/check-requisitions/{checkRequisition}/review', [CheckRequisitionController::class, 'review'])
        ->name('check-requisitions.review');
    Route::post('/check-requisitions/{checkRequisition}/approve', [CheckRequisitionController::class, 'approve'])
        ->name('check-requisitions.approve');
    Route::post('/check-requisitions/{checkRequisition}/reject', [CheckRequisitionController::class, 'reject'])
        ->name('check-requisitions.reject');

    Route::resource('disbursements', DisbursementController::class)->except(['update']);
    Route::post('disbursements/{disbursement}', [DisbursementController::class, 'update'])
        ->name('disbursements.update');

    Route::resource('remarks',RemarksController::class);










});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
