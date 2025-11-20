import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download } from 'lucide-react';
import AttachmentViewer from '@/pages/invoices/components/AttachmentViewer';

/**
 * Check Requisition Documents Tab
 * Displays generated CR document (latest + versions) and supporting files
 * Principle: Single Responsibility - Only handles documents tab display
 */
export default function CRDocumentsTab({
    files,
    checkReqVersions,
    mainPdfFile,
    formatDateTime
}) {
    const supportingDocs = files?.filter(f => f.file_purpose !== 'check_requisition') || [];
    const hasNoDocuments = (!files || files.length === 0 || (files.length === 1 && mainPdfFile));

    return (
        <div className="space-y-6">
            {/* Generated Document - Latest Version */}
            {mainPdfFile && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                            Generated Document {checkReqVersions.length > 1 && `(Latest - v${mainPdfFile.version})`}
                        </h3>
                        {checkReqVersions.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                                {checkReqVersions.length} version{checkReqVersions.length > 1 ? 's' : ''} available
                            </Badge>
                        )}
                    </div>
                    <AttachmentViewer files={[mainPdfFile]} />
                </div>
            )}

            {/* Previous Versions */}
            {checkReqVersions.length > 1 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                        Previous Versions ({checkReqVersions.length - 1})
                    </h3>
                    <div className="space-y-4">
                        {checkReqVersions.slice(1).map((file) => (
                            <div key={file.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Version {file.version}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {file.file_name} • {(file.file_size / 1024).toFixed(2)} KB
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Created: {formatDateTime(file.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = `/storage/${file.file_path}`;
                                                link.download = file.file_name;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Supporting Documents */}
            {supportingDocs.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                        Supporting Documents ({supportingDocs.length})
                    </h3>
                    <AttachmentViewer files={supportingDocs} />
                </div>
            )}

            {/* Empty State */}
            {hasNoDocuments && (
                <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No supporting documents attached to this check requisition</p>
                </div>
            )}
        </div>
    );
}
