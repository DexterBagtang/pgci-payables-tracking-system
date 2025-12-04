import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Printer, CheckCircle2, Edit, FileText, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function DisbursementReviewStep({
    formData,
    selectedCheckReqs,
    allCheckReqs,
    files,
    existingFiles,
    onEdit,
    isEditMode = false,
    removedCount = 0,
    addedCount = 0
}) {
    const selectedData = allCheckReqs.filter(cr => selectedCheckReqs.includes(cr.id));
    const totalAmount = selectedData.reduce((sum, cr) => sum + parseFloat(cr.php_amount || 0), 0);

    const formatCurrency = (amount) => {
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    // Get unique payees
    const payeeMap = selectedData.reduce((acc, cr) => {
        const payee = cr.payee_name;
        if (!acc[payee]) {
            acc[payee] = { name: payee, amount: 0, count: 0 };
        }
        acc[payee].amount += parseFloat(cr.php_amount || 0);
        acc[payee].count += 1;
        return acc;
    }, {});
    const payees = Object.values(payeeMap);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                    {isEditMode ? 'Review Changes' : 'Review Disbursement'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    {isEditMode
                        ? 'Review your changes before updating the disbursement'
                        : 'Please review all details before submitting'}
                </p>
            </div>

            {/* Financial Summary */}
            <Card className="border-l-4 border-l-green-500 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                        Financial Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-green-50 p-4">
                        <div className="text-sm text-slate-600">Total Disbursement Amount</div>
                        <div className="mt-1 text-3xl font-bold text-green-600">
                            {formatCurrency(totalAmount)}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedCheckReqs.length}</div>
                            <div className="text-xs text-slate-600">Check Requisitions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{payees.length}</div>
                            <div className="text-xs text-slate-600">Payees</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {selectedData.reduce((sum, cr) => sum + (cr.invoices_with_aging?.length || 0), 0)}
                            </div>
                            <div className="text-xs text-slate-600">Invoices</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Disbursement Details */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Disbursement Details</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => onEdit(2)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.check_voucher_number && (
                        <div>
                            <div className="text-sm font-medium text-slate-500">Check Voucher Number</div>
                            <div className="text-base font-semibold">
                                {formData.check_voucher_number}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <div className="text-sm font-medium text-slate-700">Payment Timeline</div>

                        <div className="flex items-center gap-3">
                            <Printer className={`h-5 w-5 ${formData.date_check_printing ? 'text-blue-600' : 'text-slate-300'}`} />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Check Printed</div>
                                <div className={`text-sm ${formData.date_check_printing ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {formatDate(formData.date_check_printing)}
                                </div>
                            </div>
                        </div>

                        <div className="ml-2.5 h-8 w-0.5 bg-slate-200" />

                        <div className="flex items-center gap-3">
                            <Calendar className={`h-5 w-5 ${formData.date_check_scheduled ? 'text-orange-600' : 'text-slate-300'}`} />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Scheduled for Release</div>
                                <div className={`text-sm ${formData.date_check_scheduled ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {formatDate(formData.date_check_scheduled)}
                                </div>
                            </div>
                        </div>

                        <div className="ml-2.5 h-8 w-0.5 bg-slate-200" />

                        <div className="flex items-center gap-3">
                            <CheckCircle2 className={`h-5 w-5 ${formData.date_check_released_to_vendor ? 'text-green-600' : 'text-slate-300'}`} />
                            <div className="flex-1">
                                <div className="text-sm font-medium">Released to Vendor</div>
                                <div className={`text-sm ${formData.date_check_released_to_vendor ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {formatDate(formData.date_check_released_to_vendor)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {formData.remarks && (
                        <div>
                            <div className="text-sm font-medium text-slate-500">Remarks</div>
                            <div className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                {formData.remarks}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payee Breakdown */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Payee Breakdown</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => onEdit(1)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Selection
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {payees.map((payee, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <div className="font-semibold text-slate-900">{payee.name}</div>
                                    <div className="text-sm text-slate-500">
                                        {payee.count} check requisition{payee.count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                    {formatCurrency(payee.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Check Requisitions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Selected Check Requisitions ({selectedCheckReqs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {selectedData.map((cr) => (
                            <div key={cr.id} className="rounded-lg border p-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-semibold text-blue-600">{cr.requisition_number}</div>
                                        <div className="text-sm text-slate-600">{cr.payee_name}</div>
                                        {cr.invoices_with_aging && cr.invoices_with_aging.length > 0 && (
                                            <div className="mt-1 text-xs text-slate-500">
                                                {cr.invoices_with_aging.length} invoice{cr.invoices_with_aging.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">
                                            {formatCurrency(cr.php_amount)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Attached Files */}
            {((files && files.length > 0) || (existingFiles && existingFiles.length > 0)) && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-5 w-5" />
                            Supporting Documents
                        </CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(2)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Existing Files */}
                            {existingFiles && existingFiles.length > 0 && (
                                <div>
                                    <div className="mb-2 text-sm font-medium text-slate-700">
                                        Current Files ({existingFiles.length})
                                    </div>
                                    <div className="space-y-2">
                                        {existingFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 rounded border bg-slate-50 p-2">
                                                <FileText className="h-4 w-4 text-slate-500" />
                                                <span className="text-sm">{file.filename}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Files */}
                            {files && files.length > 0 && (
                                <div>
                                    <div className="mb-2 text-sm font-medium text-green-700">
                                        New Files to Upload ({files.length})
                                    </div>
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 rounded border border-green-200 bg-green-50 p-2">
                                                <FileText className="h-4 w-4 text-green-600" />
                                                <span className="text-sm">{file.name}</span>
                                                <span className="text-xs text-slate-500">
                                                    ({(file.size / 1024).toFixed(2)} KB)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
