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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->enum('category', ['SAP', 'Manual'])->default('SAP');
            $table->string('payment_terms')->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('vendor_type', ['supplier', 'contractor', 'service_provider', 'other'])->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
