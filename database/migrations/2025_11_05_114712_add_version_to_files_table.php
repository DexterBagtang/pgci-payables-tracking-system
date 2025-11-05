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
        Schema::table('files', function (Blueprint $table) {
            $table->unsignedInteger('version')->default(1)->after('is_active');
            $table->index(['fileable_type', 'fileable_id', 'file_purpose', 'version'], 'files_purpose_version_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropIndex('files_purpose_version_index');
            $table->dropColumn('version');
        });
    }
};
