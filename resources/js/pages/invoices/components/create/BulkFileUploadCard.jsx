import { Button } from '@/components/ui/button.js';
import { cn } from '@/lib/utils.js';
import { Upload, X } from 'lucide-react';
import { memo } from 'react';

const BulkFileUploadCard = memo(
    ({ invoice, index, errors, onFileChange, onRemoveFile }) => {
        return (
            <div className="rounded border bg-slate-50/30 p-3 transition-all hover:bg-slate-50/50">
                {/* Header with invoice info and upload button */}
                <div className="mb-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-slate-900">
                            {invoice.si_number || `Invoice ${index + 1}`}
                        </h4>
                        <p
                            className={cn(
                                'text-xs',
                                errors[`bulk_${index}_files`] ? 'font-medium text-red-600' : 'text-slate-500'
                            )}
                        >
                            {invoice.files?.length || 0} file{invoice.files?.length === 1 ? '' : 's'}
                            {errors[`bulk_${index}_files`] && ' - Required!'}
                        </p>
                    </div>
                    <label
                        htmlFor={`bulk-files-${index}`}
                        className={cn(
                            'flex cursor-pointer items-center rounded-md px-2 py-1 text-xs transition-colors',
                            errors[`bulk_${index}_files`]
                                ? 'bg-red-100 text-red-700 ring-2 ring-red-500 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        )}
                    >
                        <Upload className="mr-1 h-3 w-3" />
                        Add
                    </label>
                    <input
                        id={`bulk-files-${index}`}
                        type="file"
                        multiple
                        onChange={(e) => onFileChange(index, e)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                        className="hidden"
                    />
                </div>

                {/* Error message */}
                {errors[`bulk_${index}_files`] && (
                    <div className="mb-2 rounded border border-red-200 bg-red-50 p-2">
                        <p className="text-xs text-red-600">{errors[`bulk_${index}_files`]}</p>
                    </div>
                )}

                {/* Files list */}
                <div className="space-y-1.5">
                    {invoice.files && invoice.files.length > 0 ? (
                        <>
                            {invoice.files.slice(0, 3).map((file, fileIndex) => (
                                <div
                                    key={fileIndex}
                                    className="group flex items-center justify-between rounded bg-white p-2 shadow-sm"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-slate-900" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveFile(index, fileIndex)}
                                        className="h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                        title="Remove file"
                                    >
                                        <X className="h-3 w-3 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            {invoice.files.length > 3 && (
                                <div className="rounded bg-white p-2 text-center shadow-sm">
                                    <p className="text-xs text-slate-600">
                                        +{invoice.files.length - 3} more file{invoice.files.length - 3 === 1 ? '' : 's'}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex h-16 items-center justify-center rounded border-2 border-dashed border-slate-200 bg-white/50">
                            <div className="text-center">
                                <Upload className="mx-auto mb-1 h-4 w-4 text-slate-400" />
                                <p className="text-xs text-slate-500">No files</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick stats */}
                {invoice.files && invoice.files.length > 0 && (
                    <div className="mt-2 rounded bg-blue-50/50 p-1.5">
                        <p className="text-[10px] text-blue-600">
                            Total: {(invoice.files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                )}
            </div>
        );
    },
    // Custom comparison to prevent unnecessary re-renders
    (prevProps, nextProps) => {
        return (
            prevProps.invoice.si_number === nextProps.invoice.si_number &&
            prevProps.invoice.files?.length === nextProps.invoice.files?.length &&
            prevProps.errors[`bulk_${prevProps.index}_files`] === nextProps.errors[`bulk_${nextProps.index}_files`]
        );
    }
);

BulkFileUploadCard.displayName = 'BulkFileUploadCard';

export default BulkFileUploadCard;
