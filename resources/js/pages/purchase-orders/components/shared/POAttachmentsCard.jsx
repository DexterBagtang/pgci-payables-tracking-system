import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { Button } from '@/components/ui/button.js';
import { Download, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getFileIcon } from '@/components/custom/helpers.jsx';

/**
 * POAttachmentsCard Component
 * Shared UI component for managing PO attachments/files with validation
 * Used by both CreatePOForm and EditPOForm
 * 
 * @param {Object} props
 * @param {Array} props.files - New files to be uploaded (File objects)
 * @param {Function} props.onFileChange - Callback when files are selected
 * @param {Object} props.errors - Form validation errors (combined client & server)
 * @param {Array} props.existingFiles - Existing files for the PO (for edit mode)
 * @param {Function} props.onDownloadFile - Callback to handle file download
 * @param {string} props.mode - 'create' or 'edit'
 */
export default function POAttachmentsCard({
    files,
    onFileChange,
    errors,
    existingFiles = [],
    onDownloadFile,
    mode = 'create',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Upload supporting documents for this purchase order'
                        : 'Manage attachments for this purchase order'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Existing Files Display (Edit Mode Only) */}
                    {mode === 'edit' && existingFiles && existingFiles.length > 0 && (
                        <div className="space-y-2">
                            <Label>Current Attachments</Label>
                            <div className="grid gap-1">
                                {existingFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-2 border rounded-lg bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.file_type)}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{file.file_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(file.file_size / 1024 / 1024).toFixed(2)} MB · {format(file.created_at, 'yyyy-MM-dd hh:mm a')}
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

                    {/* New File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="files" className={errors?.files ? 'text-red-600' : ''}>
                            {mode === 'edit' ? 'Upload Additional Files' : 'Upload Files'}
                        </Label>
                        <Input
                            id="files"
                            type="file"
                            multiple
                            onChange={onFileChange}
                            className={`cursor-pointer ${errors?.files ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Maximum file size: 10MB per file.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Allowed formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                            </p>
                            {mode === 'edit' && (
                                <p className="text-sm text-muted-foreground">
                                    New files will be added to existing attachments.
                                </p>
                            )}
                        </div>
                        
                        {errors?.files && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.files}
                            </p>
                        )}

                        {files && files.length > 0 && !errors?.files && (
                            <p className="text-sm text-green-600">
                                ✓ {files.length} file(s) selected for upload
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
