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
        Schema::create('audit_trails', function (Blueprint $table) {
            $table->id();
            $table->string('table_name'); // e.g., 'vendors'
            $table->unsignedBigInteger('record_id'); // ID of the record in the table
            $table->enum('action', ['create', 'update', 'delete']);
            $table->json('changes')->nullable(); // Simplified: only store what changed
            $table->foreignId('user_id')->nullable();
            $table->timestamp('performed_at');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->index(['table_name', 'record_id']);
            $table->index('performed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_trails');
    }
};
