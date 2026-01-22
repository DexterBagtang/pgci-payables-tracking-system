<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Make purchase_order_id nullable
            $table->foreignId('purchase_order_id')->nullable()->change();

            // Add direct vendor/project columns (nullable)
            $table->foreignId('vendor_id')->nullable()
                ->after('purchase_order_id')
                ->constrained('vendors')
                ->nullOnDelete();

            $table->foreignId('project_id')->nullable()
                ->after('vendor_id')
                ->constrained('projects')
                ->nullOnDelete();

            // Add invoice type enum
            $table->enum('invoice_type', ['purchase_order', 'direct'])
                ->default('purchase_order')
                ->after('id');

            // Add indexes
            $table->index(['vendor_id']);
            $table->index(['project_id']);
            $table->index(['invoice_type']);
        });

        // Check constraint: Either PO OR vendor+project must be set
        DB::statement('
            ALTER TABLE invoices ADD CONSTRAINT invoices_type_check
            CHECK (
                (purchase_order_id IS NOT NULL AND vendor_id IS NULL AND project_id IS NULL)
                OR
                (purchase_order_id IS NULL AND vendor_id IS NOT NULL AND project_id IS NOT NULL)
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop constraint first
        DB::statement('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_type_check');

        Schema::table('invoices', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex(['invoice_type']);
            $table->dropIndex(['project_id']);
            $table->dropIndex(['vendor_id']);

            // Drop foreign keys and columns
            $table->dropForeign(['project_id']);
            $table->dropForeign(['vendor_id']);
            $table->dropColumn(['invoice_type', 'vendor_id', 'project_id']);

            // Make purchase_order_id non-nullable again
            $table->foreignId('purchase_order_id')->nullable(false)->change();
        });
    }
};
