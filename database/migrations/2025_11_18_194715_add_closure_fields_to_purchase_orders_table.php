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
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignId('closed_by')->nullable()->after('finalized_at')->constrained('users');
            $table->timestamp('closed_at')->nullable()->after('closed_by');
            $table->text('closure_remarks')->nullable()->after('closed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['closed_by']);
            $table->dropColumn(['closed_by', 'closed_at', 'closure_remarks']);
        });
    }
};
