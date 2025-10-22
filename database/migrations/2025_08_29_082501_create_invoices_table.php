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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->onDelete('cascade');
            $table->string('si_number')->nullable();
            $table->date('si_date')->nullable();
            $table->date('si_received_at')->nullable();
            $table->enum('payment_type', ['cash', 'check', 'bank_transfer', 'credit_card', 'other'])->nullable();
            $table->decimal('invoice_amount', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('net_amount', 15, 2);
            $table->string('terms_of_payment')->nullable();
            $table->string('other_payment_terms')->nullable();
            $table->enum('invoice_status', ['pending','received', 'in_progress', 'approved','pending_disbursement','rejected', 'paid', 'overdue'])->default('pending');
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->date('files_received_at')->nullable();
            $table->date('submitted_at')->nullable();
            $table->string('submitted_to')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Indexes
            $table->index('si_number');
            $table->index('invoice_status');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
