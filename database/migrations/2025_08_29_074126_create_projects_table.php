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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_title');
            $table->string('cer_number');
            $table->decimal('total_project_cost', 15, 2)->nullable();
            $table->decimal('total_contract_cost', 15, 2)->nullable();
            $table->enum('project_status', ['active', 'on_hold', 'completed', 'cancelled'])->nullable();
            $table->text('description')->nullable();

            $table->enum('project_type', ['sm_project', 'philcom_project'])->nullable();
            $table->string('smpo_number')->nullable()->comment('For SM Project type');
            $table->enum('philcom_category', ['profit_and_loss', 'capital_expenditure', 'others'])
                ->nullable()->comment('For Philcom Project type');

            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index('project_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
