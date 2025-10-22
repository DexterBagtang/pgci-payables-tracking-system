<?php

use App\Http\Controllers\CheckRequisitionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\RemarksController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard');
//        return Inertia::render('welcome');
    })->name('home');

    Route::get('/dashboard', [DashboardController::class,'index'])->name('dashboard');

    Route::resource('vendors', VendorController::class);
    Route::post('vendors/bulk-activate', [VendorController::class, 'bulkActivate'])->name('vendors.bulk-activate');
    Route::post('vendors/bulk-deactivate', [VendorController::class, 'bulkDeactivate'])->name('vendors.bulk-deactivate');
    Route::post('vendors/bulk-delete', [VendorController::class, 'bulkDelete'])->name('vendors.bulk-delete');
    Route::resource('projects', ProjectController::class);
    Route::resource('purchase-orders', PurchaseOrderController::class)->except(['update']);
    Route::post('purchase-orders/{purchase_order}', [PurchaseOrderController::class, 'update'])
        ->name('purchase-orders.update');

    Route::resource('invoices', InvoiceController::class)->except(['update']);
    Route::post('invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::post('invoices/{invoice}/review', [InvoiceController::class, 'review'])->name('invoices.review');
    Route::get('/invoice/bulk-review', [InvoiceController::class, 'bulkReview'])->name('invoices.bulk-review');

    Route::post('/invoice/bulk-mark-received', [InvoiceController::class, 'bulkMarkReceived'])->name('invoices.bulk-mark-received');
    Route::post('/invoice/bulk-approve', [InvoiceController::class, 'bulkApprove'])->name('invoices.bulk-approve');
    Route::post('/invoice/bulk-reject', [InvoiceController::class, 'bulkReject'])->name('invoices.bulk-reject');


    Route::resource('check-requisitions', CheckRequisitionController::class);
    // Review and approval routes
    Route::get('/check-requisitions/{checkRequisition}/review', [CheckRequisitionController::class, 'review'])
        ->name('check-requisitions.review');
    Route::post('/check-requisitions/{checkRequisition}/approve', [CheckRequisitionController::class, 'approve'])
        ->name('check-requisitions.approve');
    Route::post('/check-requisitions/{checkRequisition}/reject', [CheckRequisitionController::class, 'reject'])
        ->name('check-requisitions.reject');
    Route::post('/check-requisitions/{checkRequisition}/upload-signed', [CheckRequisitionController::class, 'uploadSigned'])
        ->name('check-requisitions.upload-signed');

    Route::resource('remarks',RemarksController::class);










});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
