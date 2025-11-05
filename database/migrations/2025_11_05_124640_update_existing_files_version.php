<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all existing files that don't have a version set (or have version 0)
        // Set version = 1 for all existing files
        DB::table('files')
            ->where(function ($query) {
                $query->whereNull('version')
                      ->orWhere('version', 0);
            })
            ->update(['version' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this data migration
    }
};
