<?php

use App\Http\Controllers\CheckRequisitionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Dashboard\UnifiedDashboardController;
use App\Http\Controllers\DisbursementController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\RemarksController;
use App\Http\Controllers\UserController;
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
    // Note: Dashboard data access is based on authenticated user context
    // Each widget should filter data based on user's module permissions internally
    Route::prefix('api/dashboard')->group(function () {
        // Unified Dashboard Widgets (All authenticated users can view dashboard)
        // Widgets internally filter data based on user's readable modules
        Route::prefix('unified')->group(function () {
            Route::get('ap-aging', [UnifiedDashboardController::class, 'apAgingSummary']);
            Route::get('invoice-pipeline', [UnifiedDashboardController::class, 'invoicePipelineStatus']);
            Route::get('po-utilization', [UnifiedDashboardController::class, 'poUtilizationSnapshot']);
            Route::get('upcoming-cashout', [UnifiedDashboardController::class, 'upcomingCashOut']);
            Route::get('top-vendors', [UnifiedDashboardController::class, 'topVendorsByOutstanding']);
            Route::get('bottlenecks', [UnifiedDashboardController::class, 'processBottleneckIndicators']);
            Route::get('project-spend', [UnifiedDashboardController::class, 'projectSpendSummary']);
            Route::get('pending-approvals', [UnifiedDashboardController::class, 'pendingApprovalsByRole']);
            Route::get('compliance', [UnifiedDashboardController::class, 'complianceMissingDocuments']);
            Route::get('activity-feed', [UnifiedDashboardController::class, 'recentActivityFeed']);
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
    Route::get('/api/check-requisitions/{check_requisition}/edit', [CheckRequisitionController::class, 'editApi'])
        ->name('check-requisitions.edit-api');
    // Review and approval routes
    Route::get('/check-requisitions/{check_requisition}/review', [CheckRequisitionController::class, 'review'])
        ->name('check-requisitions.review');
    Route::post('/check-requisitions/{check_requisition}/approve', [CheckRequisitionController::class, 'approve'])
        ->name('check-requisitions.approve');
    Route::post('/check-requisitions/{check_requisition}/reject', [CheckRequisitionController::class, 'reject'])
        ->name('check-requisitions.reject');

    Route::resource('disbursements', DisbursementController::class)->except(['update']);
    Route::post('disbursements/{disbursement}', [DisbursementController::class, 'update'])
        ->name('disbursements.update');
    Route::get('/api/disbursements/check-voucher-unique', [DisbursementController::class, 'checkVoucherUnique'])
        ->name('disbursements.check-voucher-unique');

    // New disbursement API endpoints
    Route::post('/api/disbursements/{disbursement}/quick-release', [DisbursementController::class, 'quickRelease'])
        ->name('disbursements.quick-release');
    Route::post('/api/disbursements/bulk-release', [DisbursementController::class, 'bulkRelease'])
        ->name('disbursements.bulk-release');
    Route::post('/api/disbursements/{disbursement}/undo-release', [DisbursementController::class, 'undoRelease'])
        ->name('disbursements.undo-release');
    Route::get('/api/disbursements/smart-grouping', [DisbursementController::class, 'smartGrouping'])
        ->name('disbursements.smart-grouping');
    Route::get('/api/disbursements/calendar-data', [DisbursementController::class, 'calendarData'])
        ->name('disbursements.calendar-data');
    Route::get('/api/disbursements/kanban-data', [DisbursementController::class, 'kanbanData'])
        ->name('disbursements.kanban-data');

    Route::resource('remarks',RemarksController::class);










});

// Admin-only routes
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::resource('users', UserController::class)->except(['destroy']);
    Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->name('users.reset-password');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
