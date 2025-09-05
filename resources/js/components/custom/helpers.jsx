import { File, Image, FileText, FileSpreadsheet } from 'lucide-react';

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Add this helper function to get file icon based on type
export const getFileIcon = (fileType) => {
    if (fileType.includes('image')) {
        return <Image className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
        return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
        return <FileSpreadsheet className="h-4 w-4" />;
    } else if (fileType.includes('word')) {
        return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
};

