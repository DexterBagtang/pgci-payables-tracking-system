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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();

            // Nullable in draft, required once finalized/open
            $table->string('po_number')->nullable()->unique();
            $table->foreignId('project_id')->nullable()->constrained('projects');
            $table->foreignId('vendor_id')->nullable()->constrained('vendors');
            $table->decimal('po_amount', 15, 2)->nullable();
            $table->enum('currency', ['PHP', 'USD'])->default('PHP');

            // Simplified statuses
            $table->enum('po_status', [
                'draft',     // Created but not yet finalized
                'open',      // Active, waiting for goods/invoice
                'closed',    // Fully paid/settled
                'cancelled', // Cancelled by user
            ])->default('draft');

            $table->string('payment_term')->nullable();
            $table->date('po_date')->nullable();
            $table->date('expected_delivery_date')->nullable();
            $table->text('description')->nullable();

            // Always required
            $table->foreignId('created_by')->constrained('users');

            // Only set once draft → open
            $table->foreignId('finalized_by')->nullable()->constrained('users');
            $table->timestamp('finalized_at')->nullable();

            // Closure fields
            $table->foreignId('closed_by')->nullable()->constrained('users');
            $table->timestamp('closed_at')->nullable();
            $table->text('closure_remarks')->nullable();

            $table->timestamps();

            // Indexes for faster lookups
            $table->index('po_number');
            $table->index('po_status');
            $table->index('po_date');
            $table->index('expected_delivery_date');
            $table->index(['project_id', 'po_status']);
            $table->index(['vendor_id', 'po_status']);
        });

    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
