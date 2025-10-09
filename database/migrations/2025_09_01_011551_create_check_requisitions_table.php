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
        Schema::create('check_requisitions', function (Blueprint $table) {
            $table->id();
            $table->string('requisition_number')->unique();
//            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('requisition_status', [
                'draft',
                'pending_approval',
                'approved',
                'rejected',
                'processed',
                'paid'
            ])->default('draft');

            // Form Fields
            $table->decimal('php_amount', 15, 2);
            $table->date('request_date');
            $table->string('payee_name');
            $table->text('purpose');
            $table->string('po_number')->nullable();
            $table->string('cer_number')->nullable();
            $table->string('si_number')->nullable();
            $table->string('account_charge')->nullable();
            $table->string('service_line_dist')->nullable();
            $table->text('amount_in_words');

            // Approval Workflow
            $table->string('requested_by');
            $table->string('reviewed_by')->nullable();
            $table->string('approved_by')->nullable();

            $table->foreignId('generated_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('requisition_status');
            $table->index('request_date');
            $table->index('payee_name');
            $table->index(['requisition_status', 'request_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('check_requisitions');
    }
};
