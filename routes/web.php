<?php

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('vendors', VendorController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('purchase-orders', PurchaseOrderController::class);









});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
