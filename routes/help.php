<?php

use App\Http\Controllers\HelpController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('help', '/help/index');

    Route::get('help/index', [HelpController::class, 'index'])
        ->name('help.index');

    Route::get('help/{slug}', [HelpController::class, 'show'])
        ->name('help.show');
});
