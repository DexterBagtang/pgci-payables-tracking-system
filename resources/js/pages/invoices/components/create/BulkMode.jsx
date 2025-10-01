import { Button } from '@/components/ui/button.js';
import { Calendar } from '@/components/ui/calendar.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.js';
import { cn } from '@/lib/utils.js';
import { format } from 'date-fns';
import { CalendarIcon, Check, Copy, Plus, Receipt, Settings, Trash2, Upload, X } from 'lucide-react';
import { DatePicker } from '@/components/custom/DatePicker.jsx';
import { PaymentTermsSelect } from '@/components/custom/PaymentTermsSelect.jsx';

export default function BulkMode({
    bulkInvoices,
    resetBulkMode,
    bulkConfig,
    updateBulkInvoice,
    errors,
    handleBulkInvoiceFileChange,
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
}) {
    return (
        <>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="flex items-center text-lg">
                            <Receipt className="mr-2 h-4 w-4 text-green-600" />
                            Invoice Details ({bulkInvoices.length} items)
                        </CardTitle>
                        <CardDescription className="text-xs">Enter invoice details. Shared fields are pre-filled.</CardDescription>
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
                                    <TableHead className="w-[180px] text-xs font-medium">SI Number *</TableHead>
                                    {!bulkConfig.sharedFields.si_date && <TableHead className="text-xs font-medium">SI Date *</TableHead>}
                                    <TableHead className="text-xs font-medium">Amount *</TableHead>
                                    <TableHead className="text-center text-xs font-medium">VAT</TableHead>
                                    {!bulkConfig.sharedFields.terms_of_payment && (
                                        <TableHead className="text-xs font-medium">Terms *</TableHead>
                                    )}
                                    {!bulkConfig.sharedFields.si_received_at && <TableHead className="text-xs font-medium">Received Date *</TableHead>}
                                    {!bulkConfig.sharedFields.due_date && <TableHead className="text-xs font-medium">Due Date</TableHead>}
                                    {!bulkConfig.sharedFields.notes && <TableHead className="text-xs font-medium">Notes</TableHead>}
                                    <TableHead className="w-[80px] text-xs font-medium">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bulkInvoices.map((invoice, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50">
                                        {/* Index */}
                                        <TableCell className="text-xs font-medium text-slate-600">{index + 1}</TableCell>

                                        {/* SI Number */}
                                        <TableCell>
                                            <Input
                                                value={invoice.si_number}
                                                onChange={(e) => updateBulkInvoice(index, 'si_number', e.target.value)}
                                                placeholder={`${bulkConfig.siPrefix}${String(index + 1).padStart(3, '0')}`}
                                                className="h-8 text-xs"
                                            />
                                            {errors[`bulk_${index}_si_number`] && (
                                                <p className="mt-1 text-xs text-red-600">{errors[`bulk_${index}_si_number`]}</p>
                                            )}
                                        </TableCell>

                                        {/* SI Date */}
                                        {!bulkConfig.sharedFields.si_date && (
                                            <TableCell>
                                                <DatePicker
                                                    value={invoice.si_date}
                                                    onChange={(date) => handleBulkDateSelect(index, 'si_date', date)}
                                                    size="sm"
                                                    error={errors[`bulk_${index}_si_date`]}
                                                    placeholder="SI Date"
                                                />
                                            </TableCell>
                                        )}

                                        {/* Invoice Amount */}
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={invoice.invoice_amount}
                                                        onChange={(e) => updateBulkInvoice(index, 'invoice_amount', e.target.value)}
                                                        placeholder="0.00"
                                                        className="h-8 pr-9 text-xs" // add padding-right so text doesn't overlap
                                                    />
                                                    <span className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-500">
                                                        {selectedPO && (
                                                            <span className="font-semibold text-blue-700">
                                                                {calculatePOPercentage(invoice.invoice_amount, selectedPO.po_amount).toFixed(0)}%
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            {errors[`bulk_${index}_invoice_amount`] && (
                                                <p className="mt-1 text-xs text-red-600">{errors[`bulk_${index}_invoice_amount`]}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <div className="space-y-0.5 rounded-md border bg-slate-50 p-1 text-[11px] leading-tight text-slate-700">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Ex:</span>
                                                    <span className="font-medium">
                                                        ₱{calculateVAT(invoice.invoice_amount).vatableAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">VAT:</span>
                                                    <span className="font-medium">₱{calculateVAT(invoice.invoice_amount).vatAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Payment Terms */}
                                        {!bulkConfig.sharedFields.terms_of_payment && (
                                            <TableCell>
                                                <div className="max-w-[200px]">
                                                    <PaymentTermsSelect
                                                        value={invoice.terms_of_payment}
                                                        onChange={(value) => updateBulkInvoice(index, 'terms_of_payment', value)}
                                                        otherValue={invoice.other_payment_terms}
                                                        onOtherChange={(value) => updateBulkInvoice(index, 'other_payment_terms', value)}
                                                        error={errors[`bulk_${index}_terms_of_payment`]}
                                                        otherError={errors[`bulk_${index}_other_payment_terms`]}
                                                        paymentTermsOptions={paymentTermsOptions}
                                                        required={true}
                                                        size={'sm'}
                                                        label=''
                                                    />
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* SI Received Date */}
                                        {!bulkConfig.sharedFields.si_received_at && (
                                            <TableCell>
                                                <DatePicker
                                                    placeholder={"Received"}
                                                    value={invoice.si_received_at}
                                                    onChange={(date) => handleBulkDateSelect(index, 'si_received_at', date)}
                                                    size="sm"
                                                    error={errors[`bulk_${index}_si_received_at`]}
                                                />
                                            </TableCell>
                                        )}

                                        {/* Due Date */}
                                        {!bulkConfig.sharedFields.due_date && (
                                            <TableCell>

                                                <DatePicker
                                                    placeholder={"Due"}
                                                    value={invoice.due_date}
                                                    onChange={(date) => handleBulkDateSelect(index, 'due_date', date)}
                                                    size="sm"
                                                    error={errors[`bulk_${index}_due_date`]}
                                                />
                                            </TableCell>
                                        )}

                                        {/* Notes */}
                                        {!bulkConfig.sharedFields.notes && (
                                            <TableCell>
                                                <Input
                                                    value={invoice.notes || ''}
                                                    onChange={(e) => updateBulkInvoice(index, 'notes', e.target.value)}
                                                    placeholder="Invoice notes..."
                                                    className="h-8 text-xs"
                                                />
                                            </TableCell>
                                        )}

                                        {/* Actions */}
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => duplicateBulkInvoice(index)}
                                                    className="h-6 w-6 p-0"
                                                    title="Duplicate"
                                                >
                                                    <Copy className="h-3 w-3 text-blue-600" />
                                                </Button>
                                                {bulkInvoices.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteBulkInvoice(index)}
                                                        className="h-6 w-6 p-0"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
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
                            {Object.entries(bulkConfig.sharedFields)
                                .filter(([_, isShared]) => isShared)
                                .map(([field, _]) => {
                                    const fieldConfig = sharedFieldOptions.find((f) => f.key === field);
                                    if (!fieldConfig) return null;
                                    return (
                                        <div key={field} className="flex items-center">
                                            <Check className="mr-1 h-3 w-3 text-green-600" />
                                            <span>{fieldConfig.label}</span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                        <Upload className="mr-2 h-4 w-4 text-orange-600" />
                        Individual Invoice Attachments
                    </CardTitle>
                    <CardDescription className="text-sm">Each invoice can have separate attachments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                        {/* Grid layout - responsive columns */}
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {bulkInvoices.map((invoice, index) => (
                                <div key={index} className="rounded border bg-slate-50/30 p-3 transition-all hover:bg-slate-50/50">
                                    {/* Header with invoice info and upload button */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-sm font-medium text-slate-900">
                                                {invoice.si_number || `Invoice ${index + 1}`}
                                            </h4>
                                            <p className="text-xs text-slate-500">
                                                {invoice.files?.length || 0} file{invoice.files?.length === 1 ? '' : 's'}
                                            </p>
                                        </div>
                                        <label
                                            htmlFor={`bulk-files-${index}`}
                                            className="flex cursor-pointer items-center rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-200"
                                        >
                                            <Upload className="mr-1 h-3 w-3" />
                                            Add
                                        </label>
                                        <input
                                            id={`bulk-files-${index}`}
                                            type="file"
                                            multiple
                                            onChange={(e) => handleBulkInvoiceFileChange(index, e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Files list */}
                                    <div className="space-y-1.5">
                                        {invoice.files && invoice.files.length > 0 ? (
                                            <>
                                                {invoice.files.slice(0, 3).map((file, fileIndex) => (
                                                    <div key={fileIndex} className="group flex items-center justify-between rounded bg-white p-2 shadow-sm">
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
                                                            onClick={() => removeBulkInvoiceFile(index, fileIndex)}
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
                                    <span>{bulkInvoices.length} invoice{bulkInvoices.length === 1 ? '' : 's'}</span>
                                </div>
                                <div className="flex items-center">
                                    <Upload className="mr-1 h-3 w-3" />
                                    <span>
                            {bulkInvoices.reduce((acc, inv) => acc + (inv.files?.length || 0), 0)} total file
                                        {bulkInvoices.reduce((acc, inv) => acc + (inv.files?.length || 0), 0) === 1 ? '' : 's'}
                        </span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500">
                                Accepted: PDF, DOC, Images
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
