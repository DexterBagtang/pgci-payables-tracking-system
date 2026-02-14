<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('check_requisitions', function (Blueprint $table) {
            $table->decimal('usd_amount', 15, 2)->default(0)->after('php_amount');
            $table->enum('currency', ['PHP', 'USD', 'MIXED'])->default('PHP')->after('usd_amount')
                ->comment('Primary currency: PHP, USD, or MIXED if contains both (legacy)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('check_requisitions', function (Blueprint $table) {
            $table->dropColumn(['usd_amount', 'currency']);
        });
    }
};
