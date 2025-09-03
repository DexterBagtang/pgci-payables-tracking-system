<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'fileable_type',
        'fileable_id',
        'file_name',
        'file_path',
        'file_type',
        'file_category',
        'file_purpose',
        'file_size',
        'disk',
        'description',
        'is_active',
        'uploaded_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Relationships
     */
    public function fileable()
    {
        return $this->morphTo();
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('file_category', $category);
    }

    public function scopeByPurpose($query, $purpose)
    {
        return $query->where('file_purpose', $purpose);
    }

    public function scopeImages($query)
    {
        return $query->where('file_category', 'image');
    }

    public function scopeDocuments($query)
    {
        return $query->where('file_category', 'document');
    }

    /**
     * Accessors
     */
    public function getFormattedFileSizeAttribute()
    {
        if (!$this->file_size) {
            return null;
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getFileExtensionAttribute()
    {
        return pathinfo($this->file_name, PATHINFO_EXTENSION);
    }

    public function getDownloadUrlAttribute()
    {
        return Storage::disk($this->disk)->url($this->file_path);
    }

    /**
     * Helper methods
     */
    public function exists()
    {
        return Storage::disk($this->disk)->exists($this->file_path);
    }

    public function download()
    {
        if ($this->exists()) {
            return Storage::disk($this->disk)->download($this->file_path, $this->file_name);
        }
        return null;
    }

    public function deleteFile()
    {
        if ($this->exists()) {
            Storage::disk($this->disk)->delete($this->file_path);
        }
        $this->delete();
    }

    public function softDelete()
    {
        $this->update(['is_active' => false]);
    }

    public function getContents()
    {
        if ($this->exists()) {
            return Storage::disk($this->disk)->get($this->file_path);
        }
        return null;
    }

    public function isImage()
    {
        return $this->file_category === 'image';
    }

    public function isDocument()
    {
        return $this->file_category === 'document';
    }

    public function isPdf()
    {
        return strtolower($this->getFileExtensionAttribute()) === 'pdf';
    }
}
