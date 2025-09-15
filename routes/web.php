<?php

use App\Http\Controllers\CheckRequisitionController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\RemarksController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');

    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('vendors', VendorController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('purchase-orders', PurchaseOrderController::class)->except(['update']);
    Route::post('purchase-orders/{purchase_order}', [PurchaseOrderController::class, 'update'])
        ->name('purchase-orders.update');

    Route::resource('invoices', InvoiceController::class)->except(['update']);
    Route::post('invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::post('invoices/{invoice}/review', [InvoiceController::class, 'review'])->name('invoices.review');


    Route::resource('check-requisitions', CheckRequisitionController::class);

    Route::resource('remarks',RemarksController::class);










});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
