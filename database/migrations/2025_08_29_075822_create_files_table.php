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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('fileable_type'); // Model class name (e.g., 'App\Models\PurchaseOrder')
            $table->unsignedBigInteger('fileable_id'); // ID of the related model
            $table->string('file_name'); // Original filename
            $table->string('file_path'); // Storage path
            $table->string('file_type')->nullable(); // MIME type
            $table->string('file_category')->default('document'); // document, image, spreadsheet, etc.
            $table->string('file_purpose')->nullable(); // original_po, revised_po, invoice_copy, etc.
            $table->unsignedBigInteger('file_size')->nullable(); // Size in bytes
            $table->string('disk')->default('local'); // Storage disk (local, s3, etc.)
            $table->text('description')->nullable(); // File description/notes
            $table->boolean('is_active')->default(true); // Soft delete flag
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();

            // Indexes for performance
            $table->index(['fileable_type', 'fileable_id']);
            $table->index('file_category');
            $table->index('file_purpose');
            $table->index('is_active');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
