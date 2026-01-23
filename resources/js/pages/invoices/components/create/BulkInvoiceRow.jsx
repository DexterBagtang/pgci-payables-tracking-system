import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { TableCell, TableRow } from '@/components/ui/table.js';
import { DatePicker } from '@/components/custom/DatePicker.jsx';
import { PaymentTermsSelect } from '@/components/custom/PaymentTermsSelect.jsx';
import { Copy, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { memo, useMemo } from 'react';

const BulkInvoiceRow = memo(
    ({
        invoice,
        index,
        bulkConfig,
        selectedPO,
        errors,
        paymentTermsOptions,
        canDelete,
        calculatePOPercentage,
        calculateVAT,
        onUpdate,
        onDuplicate,
        onDelete,
        onDateChange,
        vendors,
        projects,
    }) => {
        const vendorOptions = useMemo(
            () =>
                vendors.map((vendor) => ({
                    value: vendor.id.toString(),
                    label: vendor.name,
                })),
            [vendors],
        );

        return (
            <TableRow className="hover:bg-slate-50">
                {/* Index */}
                <TableCell className="text-xs font-medium text-slate-600">{index + 1}</TableCell>

                {/* Vendor for Direct Invoices */}
                {bulkConfig.sharedValues.invoice_type === 'direct' && (
                    <TableCell>
                        <Select
                            value={invoice.vendor_id?.toString() || ''}
                            onValueChange={(value) => {
                                onUpdate(index, 'vendor_id', value);
                                onUpdate(index, 'project_id', ''); // Clear project when vendor changes
                            }}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendorOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors[`bulk_${index}_vendor_id`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`bulk_${index}_vendor_id`]}</p>
                        )}
                    </TableCell>
                )}

                {/* SI Number */}
                <TableCell>
                    <Input
                        value={invoice.si_number}
                        onChange={(e) => onUpdate(index, 'si_number', e.target.value)}
                        placeholder={`${bulkConfig.siPrefix}${String(index + 1).padStart(3, '0')}`}
                        className="h-8 text-xs"
                    />
                    {errors[`bulk_${index}_si_number`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`bulk_${index}_si_number`]}</p>
                    )}
                </TableCell>

                {/* SI Date */}
                <TableCell>
                    <DatePicker
                        value={invoice.si_date}
                        onChange={(date) => onDateChange(index, 'si_date', date)}
                        size="sm"
                        error={errors[`bulk_${index}_si_date`]}
                        placeholder="SI Date"
                    />
                </TableCell>

                {/* Invoice Amount */}
                <TableCell>
                    <div className="space-y-1">
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                value={invoice.invoice_amount}
                                onChange={(e) => onUpdate(index, 'invoice_amount', e.target.value)}
                                placeholder="0.00"
                                className="h-8 pr-9 text-xs"
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

                {/* VAT */}
                <TableCell className="align-top">
                    <div className="space-y-0.5 rounded-md border bg-slate-50 p-1 text-[11px] leading-tight text-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Ex:</span>
                            <span className="font-medium">
                                {invoice.currency === 'USD' ? '$' : '₱'}
                                {calculateVAT(invoice.invoice_amount).vatableAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">VAT:</span>
                            <span className="font-medium">
                                {invoice.currency === 'USD' ? '$' : '₱'}
                                {calculateVAT(invoice.invoice_amount).vatAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </TableCell>

                {/* Payment Terms */}
                <TableCell>
                    <div className="max-w-[200px]">
                        <PaymentTermsSelect
                            value={invoice.terms_of_payment}
                            onChange={(value) => onUpdate(index, 'terms_of_payment', value)}
                            otherValue={invoice.other_payment_terms}
                            onOtherChange={(value) => onUpdate(index, 'other_payment_terms', value)}
                            error={errors[`bulk_${index}_terms_of_payment`]}
                            otherError={errors[`bulk_${index}_other_payment_terms`]}
                            paymentTermsOptions={paymentTermsOptions}
                            required={true}
                            size={'sm'}
                            label=""
                        />
                    </div>
                </TableCell>

                {/* SI Received Date */}
                <TableCell>
                    <DatePicker
                        placeholder={'Received'}
                        value={invoice.si_received_at}
                        onChange={(date) => onDateChange(index, 'si_received_at', date)}
                        size="sm"
                        error={errors[`bulk_${index}_si_received_at`]}
                    />
                </TableCell>

                {/* Due Date */}
                <TableCell>
                    <DatePicker
                        placeholder={'Due'}
                        value={invoice.due_date}
                        onChange={(date) => onDateChange(index, 'due_date', date)}
                        size="sm"
                        error={errors[`bulk_${index}_due_date`]}
                    />
                </TableCell>

                {/* Notes */}
                <TableCell>
                    <Input
                        value={invoice.notes || ''}
                        onChange={(e) => onUpdate(index, 'notes', e.target.value)}
                        placeholder="Invoice notes..."
                        className="h-8 text-xs"
                    />
                </TableCell>

                {/* Actions */}
                <TableCell>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDuplicate(index)}
                            className="h-6 w-6 p-0"
                            title="Duplicate"
                        >
                            <Copy className="h-3 w-3 text-blue-600" />
                        </Button>
                        {canDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(index)}
                                className="h-6 w-6 p-0"
                                title="Delete"
                            >
                                <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                        )}
                    </div>
                </TableCell>
            </TableRow>
        );
    },
    // Custom comparison function for better memoization
    (prevProps, nextProps) => {
        return (
            prevProps.invoice === nextProps.invoice &&
            prevProps.index === nextProps.index &&
            prevProps.canDelete === nextProps.canDelete &&
            prevProps.errors[`bulk_${prevProps.index}_si_number`] === nextProps.errors[`bulk_${nextProps.index}_si_number`] &&
            prevProps.errors[`bulk_${prevProps.index}_si_date`] === nextProps.errors[`bulk_${nextProps.index}_si_date`] &&
            prevProps.errors[`bulk_${prevProps.index}_invoice_amount`] === nextProps.errors[`bulk_${nextProps.index}_invoice_amount`] &&
            prevProps.errors[`bulk_${prevProps.index}_terms_of_payment`] === nextProps.errors[`bulk_${nextProps.index}_terms_of_payment`] &&
            prevProps.errors[`bulk_${prevProps.index}_other_payment_terms`] === nextProps.errors[`bulk_${nextProps.index}_other_payment_terms`] &&
            prevProps.errors[`bulk_${prevProps.index}_si_received_at`] === nextProps.errors[`bulk_${nextProps.index}_si_received_at`] &&
            prevProps.errors[`bulk_${prevProps.index}_due_date`] === nextProps.errors[`bulk_${nextProps.index}_due_date`] &&
            prevProps.selectedPO?.value === nextProps.selectedPO?.value
        );
    }
);

BulkInvoiceRow.displayName = 'BulkInvoiceRow';

export default BulkInvoiceRow;
