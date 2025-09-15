import {
    FileSpreadsheetIcon,
    FileTextIcon,
    ImageIcon,
    Paperclip,
    VideoIcon,
    Eye,
    Download,
    FileIcon, Upload, FileAudioIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog.js';
import { Button } from '@/components/ui/button.js';
import { Badge } from '@/components/ui/badge.js';


function AttachmentsCard({
    files = [],
    title = 'Attachments',
    entityType = 'document',
    showUpload = false,
    onUpload = null,
    onDelete = null,
    readonly = true,
    storageBasePath = '/storage/',
    maxColumns = { md: 2, lg: 3 },
}) {
    // Helper function to get file icon based on file type
    const getFileIcon = (fileName, fileType) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const type = fileType?.toLowerCase();

        // You can customize these icons based on your icon library
        if (type?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
            return <ImageIcon className="h-8 w-8 flex-shrink-0 text-blue-500" />;
        }
        if (type?.includes('pdf') || extension === 'pdf') {
            return <FileTextIcon className="h-8 w-8 flex-shrink-0 text-red-500" />;
        }
        if (type?.includes('word') || ['doc', 'docx'].includes(extension)) {
            return <FileTextIcon className="h-8 w-8 flex-shrink-0 text-blue-600" />;
        }
        if (type?.includes('excel') || type?.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(extension)) {
            return <FileSpreadsheetIcon className="h-8 w-8 flex-shrink-0 text-green-600" />;
        }
        if (type?.includes('video') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
            return <VideoIcon className="h-8 w-8 flex-shrink-0 text-purple-500" />;
        }
        if (type?.includes('audio') || ['mp3', 'wav', 'flac'].includes(extension)) {
            return <FileAudioIcon className="h-8 w-8 flex-shrink-0 text-orange-500" />;
        }

        return <FileIcon className="h-8 w-8 flex-shrink-0 text-slate-400" />;
    };

    // Helper function to format file size
    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper function to get file URL
    const getFileUrl = (file) => {
        if (file.url) return file.url;
        if (file.file_path) return `${storageBasePath}${file.file_path}`;
        if (file.path) return `${storageBasePath}${file.path}`;
        return '#';
    };

    // Helper function to get file name
    const getFileName = (file) => {
        return file.file_name || file.name || file.filename || 'Unknown File';
    };

    // Helper function to get file size
    const getFileSize = (file) => {
        return file.file_size || file.size || 0;
    };

    // Helper function to get file type
    const getFileType = (file) => {
        return file.file_type || file.type || file.mime_type || '';
    };

    // Helper function to get file category
    const getFileCategory = (file) => {
        return file.file_category || file.category || file.tag || null;
    };

    // Helper function to get file purpose
    const getFilePurpose = (file) => {
        return file.file_purpose || file.purpose || file.description || null;
    };

    function getBadgeColor(category) {
        const colors = {
            purchase_order: "bg-blue-100 text-blue-800",
            invoice: "bg-green-100 text-green-800",
            project: "bg-purple-100 text-purple-800",
            vendor: "bg-amber-100 text-amber-800",
            check_requisition: "bg-pink-100 text-pink-800",
        }

        return colors[category] || "bg-gray-100 text-gray-800"
    }


    // Helper function to handle file download
    const handleDownload = (file) => {
        const url = getFileUrl(file);

        if (url !== "#") {
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", file.file_name); // 👈 custom file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Helper function to handle file deletion
    const handleDelete = (file) => {
        if (onDelete && typeof onDelete === 'function') {
            onDelete(file);
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                        <Paperclip className="mr-2 h-5 w-5 text-indigo-600" />
                        {title} ({files.length})
                    </CardTitle>

                    {/* Upload button if enabled */}
                    {showUpload && !readonly && onUpload && (
                        <Button variant="outline" size="sm" onClick={onUpload}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {files.length > 0 ? (
                    <div className={`grid grid-cols-1 gap-4 md:grid-cols-${maxColumns.md} lg:grid-cols-${maxColumns.lg}`}>
                        {files.map((file, index) => {
                            const fileName = getFileName(file);
                            const fileSize = getFileSize(file);
                            const fileType = getFileType(file);
                            const fileCategory = getFileCategory(file).replace('_', ' ');
                            const filePurpose = getFilePurpose(file);
                            const fileIcon = getFileIcon(fileName, fileType);

                            return (
                                <div
                                    key={file.id || index}
                                    className="rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        {fileIcon}

                                        <div className="flex gap-1">
                                            {/* View/Preview button */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" title="View Details">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2">
                                                            {getFileIcon(fileName, fileType, 'h-5 w-5')}
                                                            <span className="truncate">{fileName}</span>
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            {fileType} • {formatFileSize(fileSize)}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-4">
                                                        {/* File details grid */}
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <div className="font-medium text-slate-500">Type</div>
                                                                <div className="mt-1">{fileType || 'Unknown'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-slate-500">Size</div>
                                                                <div className="mt-1">{formatFileSize(fileSize)}</div>
                                                            </div>
                                                            {fileCategory && (
                                                                <div className="col-span-2">
                                                                    <div className="font-medium text-slate-500">Category</div>
                                                                    <div className="mt-1">{fileCategory}</div>
                                                                </div>
                                                            )}
                                                            {filePurpose && (
                                                                <div className="col-span-2">
                                                                    <div className="font-medium text-slate-500">Purpose</div>
                                                                    <div className="mt-1">{filePurpose}</div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Additional file description */}
                                                        {file.description && file.description !== filePurpose && (
                                                            <div>
                                                                <div className="mb-2 text-sm font-medium text-slate-500">Description</div>
                                                                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                                                                    {file.description}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Action buttons */}
                                                        <div className="flex gap-2">
                                                            <Button onClick={() => handleDownload(file)} className="flex-1" variant="default">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download
                                                            </Button>

                                                            {!readonly && onDelete && (
                                                                <Button
                                                                    onClick={() => handleDelete(file)}
                                                                    variant="outline"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {/* Quick download button */}
                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(file)} title="Download">
                                                <Download className="h-4 w-4" />
                                            </Button>

                                            {/* Delete button (if not readonly) */}
                                            {!readonly && onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(file)}
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* File info */}
                                    <div className="space-y-2">
                                        <div className="truncate text-sm font-medium text-slate-900" title={fileName}>
                                            {fileName}
                                        </div>

                                        <div className="text-xs text-slate-500">{formatFileSize(fileSize)}</div>

                                        {/* File category badge */}
                                        {fileCategory && (
                                            <Badge variant="outline" className={"text-xs capitalize " + getBadgeColor(fileCategory)}>
                                                {fileCategory}
                                            </Badge>
                                        )}

                                        {/* Upload date if available */}
                                        {(file.created_at || file.uploaded_at || file.date_uploaded) && (
                                            <div className="text-xs text-slate-400">
                                                Uploaded {new Date(file.created_at || file.uploaded_at || file.date_uploaded).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-500">
                        <Paperclip className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <div className="mb-2 text-base font-medium">No {title.toLowerCase()} found</div>
                        <div className="text-sm">No files have been attached to this {entityType}.</div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default AttachmentsCard;
