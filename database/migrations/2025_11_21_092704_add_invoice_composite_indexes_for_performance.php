<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds composite indexes for common query patterns in invoice review.
     * These indexes significantly improve performance for filtered and sorted queries.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // For filtered queries sorted by created date
            // Used in: /invoices, /invoice/bulk-review with status filter + sort
            $table->index(['invoice_status', 'created_at'], 'idx_invoices_status_created');

            // For filtered queries sorted by SI date
            // Used in: Date-based filtering with status
            $table->index(['invoice_status', 'si_date'], 'idx_invoices_status_si_date');

            // For filtered queries sorted by due date
            // Used in: Urgent invoice filtering
            $table->index(['invoice_status', 'due_date'], 'idx_invoices_status_due_date');

            // For files received filter with status
            // Used in: "Ready to approve" queries
            $table->index(['invoice_status', 'files_received_at'], 'idx_invoices_status_files_received');

            // For purchase order joins with status filter
            // Used in: Most queries that filter by PO and status
            $table->index(['purchase_order_id', 'invoice_status'], 'idx_invoices_po_status');

            // For vendor-based queries through PO
            // Improves join performance when filtering by vendor
            $table->index(['purchase_order_id', 'created_at'], 'idx_invoices_po_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoices_status_created');
            $table->dropIndex('idx_invoices_status_si_date');
            $table->dropIndex('idx_invoices_status_due_date');
            $table->dropIndex('idx_invoices_status_files_received');
            $table->dropIndex('idx_invoices_po_status');
            $table->dropIndex('idx_invoices_po_created');
        });
    }
};
