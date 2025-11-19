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
        Schema::create('check_requisition_disbursement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('check_requisition_id')
                ->constrained('check_requisitions')
                ->cascadeOnDelete();
            $table->foreignId('disbursement_id')
                ->constrained('disbursements')
                ->cascadeOnDelete();
            $table->timestamps();

            // Prevent duplicate check requisition being linked twice to the same disbursement
            $table->unique(['check_requisition_id', 'disbursement_id'], 'check_req_disbursement_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('check_requisition_disbursement');
    }
};
