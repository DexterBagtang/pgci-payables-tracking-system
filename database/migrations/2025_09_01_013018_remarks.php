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
        // Vendor Remarks
        Schema::create('vendor_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->enum('remark_type', [
                'note',
                'issue',
                'reminder',
                'contact_log',
                'payment_issue',
                'other'
            ]);
            $table->text('remark_text');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('low');
            $table->boolean('is_internal')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index(['vendor_id', 'remark_type']);
            $table->index(['vendor_id', 'priority']);
            $table->index('created_at');
        });

        // Project Remarks
        Schema::create('project_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->enum('remark_type', [
                'milestone',
                'issue',
                'budget_concern',
                'delay',
                'completion',
                'other'
            ]);
            $table->text('remark_text');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('low');
            $table->boolean('is_internal')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index(['project_id', 'remark_type']);
            $table->index(['project_id', 'priority']);
            $table->index('created_at');
        });

        // PO Remarks
        Schema::create('po_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('po_id')->constrained('purchase_orders')->onDelete('cascade');
            $table->enum('remark_type', [
                'approval_comment',
                'vendor_communication',
                'delivery_issue',
                'quality_concern',
                'other'
            ]);
            $table->text('remark_text');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('low');
            $table->boolean('is_internal')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index(['po_id', 'remark_type']);
            $table->index(['po_id', 'priority']);
            $table->index('created_at');
        });

        // Invoice Remarks
        Schema::create('invoice_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->enum('remark_type', [
                'discrepancy',
                'approval_note',
                'payment_instruction',
                'dispute',
                'other'
            ]);
            $table->text('remark_text');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('low');
            $table->boolean('is_internal')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index(['invoice_id', 'remark_type']);
            $table->index(['invoice_id', 'priority']);
            $table->index('created_at');
        });

        // Requisition Remarks
        Schema::create('requisition_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requisition_id')->constrained('check_requisitions')->onDelete('cascade');
            $table->enum('remark_type', [
                'approval_comment',
                'payment_instruction',
                'rejection_reason',
                'processing_note',
                'other'
            ]);
            $table->text('remark_text');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('low');
            $table->boolean('is_internal')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index(['requisition_id', 'remark_type']);
            $table->index(['requisition_id', 'priority']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition_remarks');
        Schema::dropIfExists('invoice_remarks');
        Schema::dropIfExists('po_remarks');
        Schema::dropIfExists('project_remarks');
        Schema::dropIfExists('vendor_remarks');
    }
};
