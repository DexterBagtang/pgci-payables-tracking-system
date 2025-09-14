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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('loggable_type'); // polymorphic: Vendor, Project, PO, Invoice, etc.
            $table->unsignedBigInteger('loggable_id');
            $table->string('action'); // created, updated, deleted, approved, etc.
            $table->json('changes')->nullable(); // before/after values
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['loggable_type', 'loggable_id']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
