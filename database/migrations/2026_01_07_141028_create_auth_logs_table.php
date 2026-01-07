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
        Schema::create('auth_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('event_type', ['login', 'logout', 'failed_login', 'password_reset']);
            $table->string('username_attempted')->nullable(); // For failed logins
            $table->string('session_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('login_method')->nullable(); // web, api, remember_me
            $table->json('metadata')->nullable(); // Extensible field for future data
            $table->timestamp('created_at');

            // Indexes for common queries
            $table->index('user_id');
            $table->index('event_type');
            $table->index('created_at');
            $table->index(['user_id', 'event_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auth_logs');
    }
};
