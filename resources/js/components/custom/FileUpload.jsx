import { useState, useRef, useCallback, useId } from 'react';
import { Upload, X, Download, FileText, Image as ImageIcon, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getFileIcon } from '@/components/custom/helpers.jsx';
import { format } from 'date-fns';

/**
 * Centralized FileUpload Component
 *
 * A flexible, reusable file upload component with support for:
 * - Single or multiple file uploads
 * - Drag and drop functionality
 * - File type and size validation
 * - Existing files display (for edit mode)
 * - Download functionality for existing files
 * - Multiple display variants (default, compact, card)
 *
 * @param {Object} props
 * @param {File[]} props.files - Array of File objects to be uploaded
 * @param {Function} props.onChange - Callback when files change (newFiles) => void
 * @param {Object} props.errors - Validation errors object
 * @param {string} props.error - Error message for this field
 * @param {Object[]} props.existingFiles - Array of existing file objects from server
 * @param {Function} props.onDownloadFile - Callback to download existing file (file) => void
 * @param {Function} props.onDeleteExistingFile - Callback to delete existing file (file) => void
 * @param {boolean} props.multiple - Allow multiple file selection (default: true)
 * @param {boolean} props.dragAndDrop - Enable drag and drop (default: true)
 * @param {number} props.maxFiles - Maximum number of files allowed (default: 10)
 * @param {number} props.maxSizePerFile - Max file size in MB (default: 10)
 * @param {string[]} props.accept - Accepted file types (default: all common types)
 * @param {string} props.label - Label for the upload field
 * @param {string} props.description - Description/help text
 * @param {string} props.variant - Display variant: 'default' | 'compact' | 'card' | 'minimal'
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.showFileSize - Show individual file sizes (default: true)
 * @param {boolean} props.showTotalSize - Show total size of all files (default: false)
 * @param {number} props.maxVisibleFiles - Max files to show before showing count (default: unlimited)
 * @param {string} props.id - HTML id for the input element
 * @param {string} props.className - Additional CSS classes
 */
export default function FileUpload({
    files = [],
    onChange,
    errors,
    error,
    existingFiles = [],
    onDownloadFile,
    onDeleteExistingFile,
    multiple = true,
    dragAndDrop = true,
    maxFiles = 10,
    maxSizePerFile = 10, // in MB
    accept = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
    label,
    description,
    variant = 'default',
    required = false,
    showFileSize = true,
    showTotalSize = false,
    maxVisibleFiles,
    id,
    className,
}) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const generatedId = useId();
    const inputId = id || generatedId;

    // Format file size
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }, []);

    // Get file icon helper
    const getIcon = useCallback((file) => {
        const type = file.type || file.file_type;
        if (type === 'application/pdf' || file.name?.endsWith('.pdf')) {
            return <FileText className="h-5 w-5 text-red-500" />;
        }
        if (type?.startsWith('image/') || /\.(jpg|jpeg|png|gif)$/i.test(file.name || file.file_name)) {
            return <ImageIcon className="h-5 w-5 text-blue-500" />;
        }
        return <File className="h-5 w-5 text-slate-500" />;
    }, []);

    // Validate file
    const validateFile = useCallback((file) => {
        // Check file size
        const maxSizeBytes = maxSizePerFile * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            toast.error(`File "${file.name}" is too large. Max size is ${maxSizePerFile}MB.`);
            return false;
        }

        // Check file type if accept is specified
        if (accept && accept.length > 0) {
            const fileName = file.name.toLowerCase();
            const isValidType = accept.some(type => {
                if (type.startsWith('.')) {
                    return fileName.endsWith(type.toLowerCase());
                }
                return file.type === type;
            });

            if (!isValidType) {
                toast.error(`File "${file.name}" has an invalid type. Allowed: ${accept.join(', ')}`);
                return false;
            }
        }

        return true;
    }, [maxSizePerFile, accept]);

    // Handle file selection
    const handleFileSelection = useCallback((newFiles) => {
        const fileArray = Array.from(newFiles);

        // Validate each file
        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) return;

        // Check max files limit
        const currentFiles = files || [];
        const totalFiles = currentFiles.length + validFiles.length;

        if (totalFiles > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed. You're trying to add ${totalFiles} files.`);
            return;
        }

        // If single file mode, replace existing file
        if (!multiple) {
            onChange(validFiles.slice(0, 1));
        } else {
            onChange([...currentFiles, ...validFiles]);
        }
    }, [files, onChange, multiple, maxFiles, validateFile]);

    // Handle drag events
    const handleDragOver = useCallback((e) => {
        if (!dragAndDrop) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, [dragAndDrop]);

    const handleDragLeave = useCallback((e) => {
        if (!dragAndDrop) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, [dragAndDrop]);

    const handleDrop = useCallback((e) => {
        if (!dragAndDrop) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        handleFileSelection(droppedFiles);
    }, [dragAndDrop, handleFileSelection]);

    // Handle file input change
    const handleInputChange = useCallback((e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFileSelection(selectedFiles);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFileSelection]);

    // Remove file
    const removeFile = useCallback((index) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
    }, [files, onChange]);

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

    // Determine how many files to show
    const filesToShow = maxVisibleFiles ? files.slice(0, maxVisibleFiles) : files;
    const hiddenFilesCount = maxVisibleFiles && files.length > maxVisibleFiles
        ? files.length - maxVisibleFiles
        : 0;

    // Render variants
    const renderMinimal = () => (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor={id} className={error ? 'text-red-600' : ''}>
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </Label>
            )}

            <Input
                id={id}
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                onChange={handleInputChange}
                accept={accept.join(',')}
                className={cn('cursor-pointer', error && 'border-red-500 focus:ring-red-500')}
            />

            {description && !error && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}

            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            {files.length > 0 && (
                <p className="text-sm text-green-600">
                    ✓ {files.length} file(s) selected
                </p>
            )}
        </div>
    );

    const renderCompact = () => (
        <div className={cn('space-y-3', className)}>
            {/* Existing Files (Edit Mode) */}
            {existingFiles && existingFiles.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Attachments</Label>
                    <div className="space-y-1">
                        {existingFiles.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {getFileIcon ? getFileIcon(file.file_type) : getIcon(file)}
                                    <span className="text-sm truncate">{file.file_name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        ({(file.file_size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {onDownloadFile && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDownloadFile(file)}
                                            className="shrink-0 h-8 w-8 p-0"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onDeleteExistingFile && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteExistingFile(file)}
                                            className="shrink-0 h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Section */}
            <div className="space-y-2">
                {label && (
                    <Label htmlFor={inputId} className={cn("text-sm font-medium", error ? 'text-red-600' : '')}>
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </Label>
                )}

                <div
                    className="border-2 border-dashed rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Input
                        id={inputId}
                        ref={fileInputRef}
                        type="file"
                        multiple={multiple}
                        onChange={handleInputChange}
                        accept={accept.join(',')}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            Click to upload files
                        </span>
                        {description && (
                            <span className="text-xs text-gray-500">
                                {description}
                            </span>
                        )}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Files</Label>
                    <div className="space-y-1">
                        {filesToShow.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {getIcon(file)}
                                    <span className="text-sm truncate">{file.name}</span>
                                    {showFileSize && (
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            ({formatFileSize(file.size)})
                                        </span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {hiddenFilesCount > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                +{hiddenFilesCount} more file(s)
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderDefault = () => (
        <div className={cn('space-y-3', className)}>
            {label && (
                <Label htmlFor={id} className={error ? 'text-red-600' : ''}>
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </Label>
            )}

            {/* Existing Files (Edit Mode) */}
            {existingFiles && existingFiles.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Current Attachments</Label>
                    <div className="grid gap-1">
                        {existingFiles.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-2 border rounded-lg bg-muted/20"
                            >
                                <div className="flex items-center gap-3">
                                    {getFileIcon ? getFileIcon(file.file_type) : getIcon(file)}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{file.file_name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                            {file.created_at && ` • ${format(new Date(file.created_at), 'yyyy-MM-dd hh:mm a')}`}
                                        </span>
                                    </div>
                                </div>
                                {onDownloadFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDownloadFile(file)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Drag and Drop Zone */}
            {dragAndDrop ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all',
                        isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : error
                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                    )}
                >
                    <Upload
                        className={cn(
                            'mx-auto h-12 w-12 transition-colors',
                            isDragging ? 'text-blue-500' : error ? 'text-red-400' : 'text-slate-400'
                        )}
                    />
                    <p className="mt-2 text-sm font-medium text-slate-700">
                        {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {accept.join(', ')} up to {maxSizePerFile}MB
                        {multiple && ` (max ${maxFiles} files)`}
                    </p>
                </div>
            ) : (
                <Input
                    id={id}
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    onChange={handleInputChange}
                    accept={accept.join(',')}
                    className={cn('cursor-pointer', error && 'border-red-500 focus:ring-red-500')}
                />
            )}

            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                onChange={handleInputChange}
                accept={accept.join(',')}
                className="hidden"
            />

            {/* Description */}
            {description && !error && (
                <div className="space-y-1">
                    {description.split('\n').map((line, i) => (
                        <p key={i} className="text-sm text-muted-foreground">{line}</p>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            {/* Selected Files List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-700">
                            {existingFiles.length > 0 ? 'New Files' : 'Selected Files'} ({files.length}/{maxFiles})
                        </Label>
                        {showTotalSize && (
                            <span className="text-xs text-muted-foreground">
                                Total: {formatFileSize(totalSize)}
                            </span>
                        )}
                    </div>
                    <div className="space-y-2">
                        {filesToShow.map((file, index) => (
                            <Card key={index} className="p-3">
                                <div className="flex items-center gap-3">
                                    {getIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate text-sm font-medium text-slate-900">
                                            {file.name}
                                        </div>
                                        {showFileSize && (
                                            <div className="text-xs text-slate-500">
                                                {formatFileSize(file.size)}
                                            </div>
                                        )}
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
                        {hiddenFilesCount > 0 && (
                            <div className="text-center p-2 bg-muted/30 rounded">
                                <p className="text-xs text-muted-foreground">
                                    +{hiddenFilesCount} more file(s)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Success Message */}
            {files.length > 0 && !error && (
                <p className="text-sm text-green-600">
                    ✓ {files.length} file(s) ready for upload
                </p>
            )}
        </div>
    );

    const renderCard = () => (
        <Card className={className}>
            <div className="p-4">
                {renderDefault()}
            </div>
        </Card>
    );

    // Render based on variant
    switch (variant) {
        case 'minimal':
            return renderMinimal();
        case 'compact':
            return renderCompact();
        case 'card':
            return renderCard();
        default:
            return renderDefault();
    }
}
