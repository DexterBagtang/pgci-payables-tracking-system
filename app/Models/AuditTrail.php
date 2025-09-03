<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditTrail extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'table_name',
        'record_id',
        'action',
        'changes',
        'user_id',
        'performed_at',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'changes' => 'array',
        'performed_at' => 'datetime'
    ];

    /**
     * Get the user who performed the action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for filtering by table name
     */
    public function scopeForTable($query, $tableName)
    {
        return $query->where('table_name', $tableName);
    }

    /**
     * Scope for filtering by record ID
     */
    public function scopeForRecord($query, $recordId)
    {
        return $query->where('record_id', $recordId);
    }

    /**
     * Scope for filtering by action type
     */
    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }
}
