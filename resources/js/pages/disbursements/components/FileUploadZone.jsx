import { useState, useRef } from 'react';
import { Upload, X, FileText, File, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function FileUploadZone({ files, onChange, maxFiles = 10 }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => {
            // Validate file type (PDF, images)
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert(`Invalid file type: ${file.name}. Only PDF and images are allowed.`);
                return false;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert(`File too large: ${file.name}. Max size is 10MB.`);
                return false;
            }

            return true;
        });

        const currentFiles = files || [];
        const totalFiles = currentFiles.length + validFiles.length;

        if (totalFiles > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed. You're trying to add ${totalFiles} files.`);
            return;
        }

        onChange([...currentFiles, ...validFiles]);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (file) => {
        if (file.type === 'application/pdf') {
            return <FileText className="h-8 w-8 text-red-500" />;
        }
        if (file.type.startsWith('image/')) {
            return <ImageIcon className="h-8 w-8 text-blue-500" />;
        }
        return <File className="h-8 w-8 text-slate-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all',
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                )}
            >
                <Upload className={cn(
                    'mx-auto h-12 w-12 transition-colors',
                    isDragging ? 'text-blue-500' : 'text-slate-400'
                )} />
                <p className="mt-2 text-sm font-medium text-slate-700">
                    {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    PDF, JPG, PNG up to 10MB (max {maxFiles} files)
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                className="hidden"
            />

            {/* File List */}
            {files && files.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">
                        Uploaded Files ({files.length}/{maxFiles})
                    </div>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <Card key={index} className="p-3">
                                <div className="flex items-center gap-3">
                                    {getFileIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate text-sm font-medium text-slate-900">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {formatFileSize(file.size)}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
