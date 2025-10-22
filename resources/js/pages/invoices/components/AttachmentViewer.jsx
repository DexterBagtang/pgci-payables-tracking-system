import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Download,
    Eye,
    FileText,
    Image as ImageIcon,
    ZoomIn,
    ZoomOut,
    RotateCw,
    X,
    ChevronLeft,
    ChevronRight,
    Maximize2,
} from 'lucide-react';

export default function AttachmentViewer({ files = [] }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    const openFile = (file, index) => {
        setSelectedFile(file);
        setSelectedIndex(index);
        setZoom(100);
        setRotation(0);
    };

    const closeViewer = () => {
        setSelectedFile(null);
        setZoom(100);
        setRotation(0);
    };

    const navigateFile = (direction) => {
        const newIndex = direction === 'next'
            ? Math.min(files.length - 1, selectedIndex + 1)
            : Math.max(0, selectedIndex - 1);

        setSelectedIndex(newIndex);
        setSelectedFile(files[newIndex]);
        setZoom(100);
        setRotation(0);
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(200, prev + 25));
    const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 25));
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

    const getFilePath = (file) => {
        // If file_path already starts with http/https, use it as is
        if (file.file_path?.startsWith('http')) {
            return file.file_path;
        }
        // Otherwise, prepend /storage/
        return `/storage/${file.file_path}`;
    };

    const downloadFile = (file) => {
        const link = document.createElement('a');
        link.href = getFilePath(file);
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
            return 'image';
        }
        if (extension === 'pdf') {
            return 'pdf';
        }
        return 'unknown';
    };

    const getFileIcon = (fileName) => {
        const type = getFileType(fileName);
        if (type === 'image') return <ImageIcon className="h-4 w-4 text-purple-600" />;
        if (type === 'pdf') return <FileText className="h-4 w-4 text-red-600" />;
        return <FileText className="h-4 w-4 text-slate-600" />;
    };

    const getFileTypeColor = (fileName) => {
        const type = getFileType(fileName);
        if (type === 'image') return 'from-purple-100 to-purple-200 border-purple-300';
        if (type === 'pdf') return 'from-red-100 to-red-200 border-red-300';
        return 'from-slate-100 to-slate-200 border-slate-300';
    };

    const renderFileContent = () => {
        if (!selectedFile) return null;

        const fileType = getFileType(selectedFile.file_name);
        const filePath = getFilePath(selectedFile);

        if (fileType === 'pdf') {
            return (
                <iframe
                    src={filePath}
                    className="w-full h-full border-0 rounded-lg"
                    title={selectedFile.file_name}
                    style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.2s ease-in-out',
                    }}
                />
            );
        }

        if (fileType === 'image') {
            return (
                <img
                    src={filePath}
                    alt={selectedFile.file_name}
                    className="max-h-full max-w-full object-contain"
                    style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.2s ease-in-out',
                    }}
                />
            );
        }

        return (
            <div className="text-center">
                <FileText className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                <p className="text-sm text-slate-600 mb-2">Preview not available</p>
                <Button size="sm" onClick={() => downloadFile(selectedFile)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                </Button>
            </div>
        );
    };

    if (!files || files.length === 0) {
        return (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-1">No files attached</p>
                <p className="text-[10px] text-slate-400">Files will appear here when uploaded</p>
            </div>
        );
    }

    return (
        <>
            <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                    {files.map((file, index) => {
                        const fileType = getFileType(file.file_name);
                        return (
                            <div
                                key={file.id}
                                className="group flex items-center justify-between rounded-xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3 transition-all hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                                    <div className={`rounded-lg bg-gradient-to-br p-2 ${getFileTypeColor(file.file_name)}`}>
                                        {getFileIcon(file.file_name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-xs font-bold text-slate-900">
                                            {file.file_name}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                            <span className="font-medium">
                                                {(file.file_size / 1024).toFixed(2)} KB
                                            </span>
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                                {fileType.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 opacity-0 transition-all group-hover:opacity-100 hover:bg-blue-100"
                                        onClick={() => openFile(file, index)}
                                    >
                                        <Eye className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 opacity-0 transition-all group-hover:opacity-100 hover:bg-emerald-100"
                                        onClick={() => downloadFile(file)}
                                    >
                                        <Download className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <Dialog open={!!selectedFile} onOpenChange={closeViewer}>
                <DialogContent className="!max-w-6xl !h-[90vh] flex flex-col p-0 gap-0">
                    {/* Header */}
                    <DialogHeader className="p-2">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`rounded-lg bg-gradient-to-br p-2 ${selectedFile ? getFileTypeColor(selectedFile.file_name) : ''}`}>
                                    {selectedFile && getFileIcon(selectedFile.file_name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <DialogTitle className="text-base truncate">
                                        {selectedFile?.file_name}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        {selectedFile && `${(selectedFile.file_size / 1024).toFixed(2)} KB • ${getFileType(selectedFile.file_name).toUpperCase()}`}
                                    </DialogDescription>
                                </div>
                            </div>

                            {/* Navigation and Controls */}
                            <div className="flex items-center gap-2 shrink-0 mx-12">
                                {files.length > 1 && (
                                    <div className="flex items-center gap-1 border-r pr-2 mr-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => navigateFile('prev')}
                                            disabled={selectedIndex === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="px-2 text-xs font-semibold text-slate-600">
                                            {selectedIndex + 1} / {files.length}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => navigateFile('next')}
                                            disabled={selectedIndex === files.length - 1}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 50}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <div className="px-2 text-xs font-semibold text-slate-600 min-w-[50px] text-center">
                                    {zoom}%
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 200}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 ml-1"
                                    onClick={handleRotate}
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 ml-1"
                                    onClick={() => selectedFile && downloadFile(selectedFile)}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Content - Properly centered */}
                    <div className="flex-1 flex items-center justify-center p-6 bg-slate-900 min-h-0 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                            {renderFileContent()}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
