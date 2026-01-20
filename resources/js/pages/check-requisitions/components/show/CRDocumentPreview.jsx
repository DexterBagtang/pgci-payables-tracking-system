import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileText } from 'lucide-react';

/**
 * Check Requisition Document Preview Sidebar
 * Displays PDF preview with download/print actions
 * Principle: Single Responsibility - Only handles document preview display
 */
export default function CRDocumentPreview({
    mainPdfFile,
    onDownload,
    onPrint
}) {
    if (!mainPdfFile) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No PDF available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                    Document Preview
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* PDF Viewer */}
                <div className="flex-1 rounded-lg bg-slate-100">
                    <iframe
                        src={`/storage/${mainPdfFile.file_path}#toolbar=0`}
                        className="w-full border-0 h-full"
                        title="Check Requisition PDF"
                        style={{ border: 'none' }}
                    />
                </div>

                {/* File Info */}
                <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                        {mainPdfFile.file_name}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                        PDF • {(mainPdfFile.file_size / 1024).toFixed(2)} KB
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={onDownload}
                            className="flex-1"
                            size="sm"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button
                            onClick={onPrint}
                            variant="outline"
                            size="sm"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Open
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
