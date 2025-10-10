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
        Schema::create('check_requisition_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('check_requisition_id')
                ->constrained('check_requisitions')
                ->cascadeOnDelete();
            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->cascadeOnDelete();
            $table->timestamps();

            // prevent duplicate invoice being linked twice to the same requisition
//            $table->unique(['check_requisition_id', 'invoice_id']);
            $table->unique(['check_requisition_id', 'invoice_id'], 'check_req_invoice_unique');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('check_requisition_invoices');
    }
};
