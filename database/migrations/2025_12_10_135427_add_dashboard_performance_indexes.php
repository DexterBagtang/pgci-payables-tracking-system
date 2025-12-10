<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds indexes optimized for dashboard widget queries based on UnifiedMetricsService analysis.
     */
    public function up(): void
    {
        // INVOICES TABLE - Most heavily queried (9 widgets)
        Schema::table('invoices', function (Blueprint $table) {
            // Single column index for date range filtering (Widgets 1, 2, 5, 6)
            $table->index('si_received_at', 'idx_invoices_si_received_at');

            // CRITICAL: Composite index for most common query pattern (status + date filtering)
            $table->index(['invoice_status', 'si_received_at'], 'idx_invoices_status_si_received');

            // Bottleneck analysis index (Widget 6)
            $table->index('reviewed_at', 'idx_invoices_reviewed_at');
        });

        // PURCHASE ORDERS TABLE - Used in 4 widgets
        Schema::table('purchase_orders', function (Blueprint $table) {
            // Date range filtering for utilization and project spend (Widgets 3, 7)
            $table->index('finalized_at', 'idx_po_finalized_at');

            // Common pattern: status + date range (Widget 3)
            $table->index(['po_status', 'finalized_at'], 'idx_po_status_finalized');
        });

        // ACTIVITY LOGS TABLE - Widget 10 (Activity Feed)
        Schema::table('activity_logs', function (Blueprint $table) {
            // Ordering and date range filtering
            $table->index('created_at', 'idx_activity_logs_created_at');

            // Foreign key for eager loading user relationship
            $table->index('user_id', 'idx_activity_logs_user_id');
        });

        // FILES TABLE - Widget 9 (Document Compliance)
        Schema::table('files', function (Blueprint $table) {
            // Polymorphic queries with active filter: whereHas('files', fn($q) => $q->where('is_active', true))
            $table->index(['fileable_type', 'fileable_id', 'is_active'], 'idx_files_polymorphic_active');
        });

        // DISBURSEMENTS TABLE - Widget 6 (Bottlenecks)
        Schema::table('disbursements', function (Blueprint $table) {
            // Used in approved-to-disbursed bottleneck calculations
            $table->index('date_check_printing', 'idx_disbursements_check_printing');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoices_si_received_at');
            $table->dropIndex('idx_invoices_status_si_received');
            $table->dropIndex('idx_invoices_reviewed_at');
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropIndex('idx_po_finalized_at');
            $table->dropIndex('idx_po_status_finalized');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('idx_activity_logs_created_at');
            $table->dropIndex('idx_activity_logs_user_id');
        });

        Schema::table('files', function (Blueprint $table) {
            $table->dropIndex('idx_files_polymorphic_active');
        });

        Schema::table('disbursements', function (Blueprint $table) {
            $table->dropIndex('idx_disbursements_check_printing');
        });
    }
};
