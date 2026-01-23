import { Button } from '@/components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table.js';
import { cn } from '@/lib/utils.js';
import { Check, Plus, Receipt, Settings, Upload, X, FileStack, AlertCircle, FileText, MousePointerClick } from 'lucide-react';
import BulkInvoiceRow from '@/pages/invoices/components/create/BulkInvoiceRow.jsx';
import BulkFileUploadCard from '@/pages/invoices/components/create/BulkFileUploadCard.jsx';
import { useMemo } from 'react';
import { useDragAndDrop } from '@/pages/invoices/components/create/hooks/useDragAndDrop.js';
import { toast } from 'sonner';

export default function BulkMode({
    bulkInvoices,
    resetBulkMode,
    bulkConfig,
    updateBulkInvoice,
    errors,
    handleBulkInvoiceFileChange,
    removeBulkInvoiceFile,
    handleBulkDateSelect,
    paymentTermsOptions,
    duplicateBulkInvoice,
    deleteBulkInvoice,
    createEmptyInvoice,
    setBulkInvoices,
    sharedFieldOptions,
    selectedPO,
    calculatePOPercentage,
    calculateVAT,
    bulkFiles,
    setBulkFiles,
    fileMatching,
    handleBulkFilesUpload,
    handleRemoveMatchedFile,
    handleReassignFile,
    vendors = [],
    projects = [],
}) {
    // Handle drag and drop file upload
    const handleFilesDropped = (files) => {
        const validFiles = files.filter((file) => {
            const maxSize = 20 * 1024 * 1024; // 20MB
            return file.size <= maxSize;
        });

        if (validFiles.length !== files.length) {
            const oversizedCount = files.length - validFiles.length;
            toast.error(`${oversizedCount} file(s) were too large (max 20MB) and were not uploaded.`);
        }

        if (validFiles.length > 0) {
            // Create a synthetic event to pass to the existing handler
            const syntheticEvent = {
                target: {
                    files: validFiles,
                    value: '',
                },
            };
            handleBulkFilesUpload(syntheticEvent);
        }
    };

    const { isDragging, dragHandlers } = useDragAndDrop(handleFilesDropped);

    // Memoize computed values
    const canDelete = useMemo(() => bulkInvoices.length > 1, [bulkInvoices.length]);

    const matchedFilesCount = useMemo(
        () => fileMatching?.filter((m) => m.matched).length || 0,
        [fileMatching]
    );

    const unmatchedFilesCount = useMemo(
        () => fileMatching?.filter((m) => !m.matched).length || 0,
        [fileMatching]
    );

    const totalFilesCount = useMemo(
        () => bulkInvoices.reduce((acc, inv) => acc + (inv.files?.length || 0), 0),
        [bulkInvoices]
    );

    const hasIndividualFiles = useMemo(
        () => totalFilesCount > 0,
        [totalFilesCount]
    );

    const sharedFieldsList = useMemo(
        () =>
            Object.entries(bulkConfig.sharedFields)
                .filter(([_, isShared]) => isShared)
                .map(([field, _]) => {
                    const fieldConfig = sharedFieldOptions.find((f) => f.key === field);
                    return fieldConfig;
                })
                .filter(Boolean),
        [bulkConfig.sharedFields, sharedFieldOptions]
    );

    return (
        <>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="flex items-center text-lg">
                            <Receipt className="mr-2 h-4 w-4 text-green-600" />
                            Invoice Details ({bulkInvoices.length} items)
                        </CardTitle>
                        <CardDescription className="text-xs">Enter invoice details. Shared values are pre-filled but can be edited for flexibility.</CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetBulkMode}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                        <Settings className="mr-1 h-3 w-3" />
                        Reconfigure
                    </Button>
                </CardHeader>
                <CardContent className="p-3">
                    {/* Table Container */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-100 hover:bg-slate-100">
                                    <TableHead className="w-[50px] text-xs font-medium">#</TableHead>
                                    {bulkConfig.sharedValues.invoice_type === 'direct' && (
                                        <TableHead className="text-xs font-medium">Vendor *</TableHead>
                                    )}
                                    <TableHead className="w-[180px] text-xs font-medium">SI Number *</TableHead>
                                    <TableHead className="text-xs font-medium">SI Date *</TableHead>
                                    <TableHead className="text-xs font-medium">Amount *</TableHead>
                                    <TableHead className="text-center text-xs font-medium">VAT</TableHead>
                                    <TableHead className="text-xs font-medium">Terms *</TableHead>
                                    <TableHead className="text-xs font-medium">Received Date *</TableHead>
                                    <TableHead className="text-xs font-medium">Due Date</TableHead>
                                    <TableHead className="text-xs font-medium">Notes</TableHead>
                                    <TableHead className="w-[80px] text-xs font-medium">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bulkInvoices.map((invoice, index) => (
                                    <BulkInvoiceRow
                                        key={index}
                                        invoice={invoice}
                                        index={index}
                                        bulkConfig={bulkConfig}
                                        selectedPO={selectedPO}
                                        errors={errors}
                                        paymentTermsOptions={paymentTermsOptions}
                                        canDelete={canDelete}
                                        calculatePOPercentage={calculatePOPercentage}
                                        calculateVAT={calculateVAT}
                                        onUpdate={updateBulkInvoice}
                                        onDuplicate={duplicateBulkInvoice}
                                        onDelete={deleteBulkInvoice}
                                        onDateChange={handleBulkDateSelect}
                                        vendors={vendors}
                                        projects={projects}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Add Invoice Button */}
                    <div className="mt-3 flex justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setBulkInvoices((prev) => [...prev, createEmptyInvoice(prev.length)]);
                            }}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Row
                        </Button>
                    </div>

                    {/* Shared Configuration Summary */}
                    <div className="mt-4 rounded border bg-blue-50 p-3">
                        <h4 className="mb-2 text-sm font-medium text-blue-800">Shared Configuration Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 md:grid-cols-4">
                            {sharedFieldsList.map((fieldConfig) => (
                                <div key={fieldConfig.key} className="flex items-center">
                                    <Check className="mr-1 h-3 w-3 text-green-600" />
                                    <span>{fieldConfig.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                        <Upload className="mr-2 h-4 w-4 text-orange-600" />
                        Individual Invoice Attachments <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </CardTitle>
                    <CardDescription className="text-sm">Upload files individually, or use bulk upload below</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                        {/* Grid layout - responsive columns */}
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {bulkInvoices.map((invoice, index) => (
                                <BulkFileUploadCard
                                    key={index}
                                    invoice={invoice}
                                    index={index}
                                    errors={errors}
                                    onFileChange={handleBulkInvoiceFileChange}
                                    onRemoveFile={removeBulkInvoiceFile}
                                />
                            ))}
                        </div>

                        {/* Empty state when no invoices */}
                        {bulkInvoices.length === 0 && (
                            <div className="flex h-32 items-center justify-center rounded border-2 border-dashed border-slate-200">
                                <div className="text-center">
                                    <Receipt className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                                    <p className="text-sm text-slate-500">No invoices created yet</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Global file stats */}
                    {bulkInvoices.length > 0 && (
                        <div className="mt-4 flex items-center justify-between rounded border bg-slate-50 p-3">
                            <div className="flex items-center space-x-4 text-xs text-slate-600">
                                <div className="flex items-center">
                                    <Receipt className="mr-1 h-3 w-3" />
                                    <span>
                                        {bulkInvoices.length} invoice{bulkInvoices.length === 1 ? '' : 's'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Upload className="mr-1 h-3 w-3" />
                                    <span>
                                        {totalFilesCount} total file{totalFilesCount === 1 ? '' : 's'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500">Accepted: PDF, DOC, Images</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bulk File Upload Section */}
            <Card className="shadow-sm border-2 border-blue-200">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center text-lg">
                        <FileStack className="mr-2 h-5 w-5 text-blue-600" />
                        Bulk File Upload
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Upload exactly {bulkInvoices.length} files (one per invoice) or 1 file to share across all invoices. Other quantities will be rejected or trimmed.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Upload Area with Drag & Drop */}
                    <div
                        {...dragHandlers}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                            isDragging
                                ? "border-blue-500 bg-blue-100/50 scale-[1.02] shadow-lg"
                                : "border-blue-300 bg-blue-50/30 hover:bg-blue-50/50 hover:border-blue-400"
                        )}
                    >
                        <input
                            id="bulk-files-upload"
                            type="file"
                            multiple
                            onChange={handleBulkFilesUpload}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                        />
                        <label htmlFor="bulk-files-upload" className="cursor-pointer block">
                            {isDragging ? (
                                <>
                                    <Upload className="mx-auto h-16 w-16 text-blue-600 mb-3 animate-bounce" />
                                    <p className="text-lg font-semibold text-blue-700 mb-1">
                                        Drop files here!
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        Release to upload
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <Upload className="h-12 w-12 text-blue-500" />
                                        <MousePointerClick className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-base font-medium text-gray-700 mb-1">
                                        Drag & drop files here, or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        PDF, DOC, Images • Max 20MB per file • Multiple files supported
                                    </p>
                                    <div className="mt-3 rounded bg-white/80 border border-blue-200 p-2 inline-block">
                                        <p className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            Two modes: Upload exactly {bulkInvoices.length} files for 1:1 matching, or 1 file to share across all
                                        </p>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>

                    {/* File Matching Preview or Helpful Empty State */}
                    {fileMatching && fileMatching.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-700">
                                    File Matching ({fileMatching.length} files)
                                </h4>
                                <div className="flex gap-2 text-xs">
                                    <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                                        {matchedFilesCount} Matched
                                    </span>
                                    <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-700">
                                        {unmatchedFilesCount} Unmatched
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {fileMatching.map((match, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border-2",
                                            match.matched
                                                ? "bg-green-50/50 border-green-200"
                                                : "bg-yellow-50/50 border-yellow-200"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {match.matched ? (
                                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate" title={match.file.name}>
                                                        {match.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(match.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {match.matched ? (
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-3 w-3 text-green-600" />
                                                    <span className="text-xs font-medium text-green-700">
                                                        → {match.invoiceNumber}
                                                    </span>
                                                </div>
                                            ) : (
                                                <Select
                                                    value={match.invoiceIndex?.toString() || ""}
                                                    onValueChange={(value) => handleReassignFile(index, parseInt(value))}
                                                >
                                                    <SelectTrigger className="h-8 w-40 text-xs">
                                                        <SelectValue placeholder="Assign to invoice..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {bulkInvoices.map((inv, invIndex) => (
                                                            <SelectItem key={invIndex} value={invIndex.toString()}>
                                                                {inv.si_number || `Invoice ${invIndex + 1}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveMatchedFile(index)}
                                                className="h-7 w-7 p-0"
                                            >
                                                <X className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {fileMatching.filter(m => !m.matched).length > 0 && (
                                <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-yellow-800">
                                            <p className="font-medium mb-1">Some files couldn't be auto-matched</p>
                                            <p>Please manually assign them to invoices using the dropdown above.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-6">
                            <div className="text-center">
                                <FileStack className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                {hasIndividualFiles ? (
                                    <>
                                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                                            Bulk upload available
                                        </h4>
                                        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                                            You've already uploaded {totalFilesCount} file{totalFilesCount === 1 ? '' : 's'} individually.
                                            Use bulk upload here to add more files and auto-match them by SI number.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="text-sm font-medium text-slate-700 mb-2">No bulk files uploaded yet</h4>
                                        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                                            Upload exactly {bulkInvoices.length} files to match them 1:1 with invoices, or upload 1 file to share across all.
                                        </p>
                                    </>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                                    <div className="rounded bg-white border border-green-200 p-3 text-left">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span className="text-xs font-semibold text-slate-700">1:1 Matching</span>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-1">Upload {bulkInvoices.length} files:</p>
                                        <p className="text-xs text-slate-500">Files will be matched to invoices in order (1st file → 1st invoice, etc.)</p>
                                    </div>
                                    <div className="rounded bg-white border border-blue-200 p-3 text-left">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileStack className="h-4 w-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-slate-700">Shared File</span>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-1">Upload 1 file:</p>
                                        <p className="text-xs text-slate-500">Single file will be shared across all {bulkInvoices.length} invoices</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
