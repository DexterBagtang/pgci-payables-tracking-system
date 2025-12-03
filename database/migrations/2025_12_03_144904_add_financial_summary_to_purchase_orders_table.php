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
            // Financial summary columns - calculated from invoices
            $table->decimal('total_invoiced', 15, 2)->default(0)->after('po_amount')
                ->comment('Sum of all invoice amounts');
            $table->decimal('total_paid', 15, 2)->default(0)->after('total_invoiced')
                ->comment('Sum of net_amount from paid invoices');
            $table->decimal('outstanding_amount', 15, 2)->default(0)->after('total_paid')
                ->comment('po_amount - total_paid');

            // Track when these were last calculated
            $table->timestamp('financials_updated_at')->nullable()->after('outstanding_amount')
                ->comment('Last time financial summary was synced');

            // Add indexes for fast filtering/sorting
            $table->index('outstanding_amount');
            $table->index('total_paid');
            $table->index(['po_status', 'outstanding_amount']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['purchase_orders_outstanding_amount_index']);
            $table->dropIndex(['purchase_orders_total_paid_index']);
            $table->dropIndex(['purchase_orders_po_status_outstanding_amount_index']);

            // Drop columns
            $table->dropColumn([
                'total_invoiced',
                'total_paid',
                'outstanding_amount',
                'financials_updated_at',
            ]);
        });
    }
};
