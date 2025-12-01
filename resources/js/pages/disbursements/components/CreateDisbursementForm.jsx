import React, { useState, useRef } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { DatePicker } from '@/components/custom/DatePicker';

export default function CreateDisbursementForm({ checkRequisitions, filters }) {
    const { data } = checkRequisitions;
    const [selectedCheckReqs, setSelectedCheckReqs] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const fileInputRef = useRef(null);

    const { data: formData, setData, post, processing, errors, reset } = useForm({
        check_voucher_number: '',
        date_check_scheduled: '',
        date_check_released_to_vendor: '',
        date_check_printing: '',
        remarks: '',
        check_requisition_ids: [],
        files: [],
    });

    const toggleCheckReq = (checkReqId) => {
        const newSelected = selectedCheckReqs.includes(checkReqId)
            ? selectedCheckReqs.filter((id) => id !== checkReqId)
            : [...selectedCheckReqs, checkReqId];

        setSelectedCheckReqs(newSelected);
        setData('check_requisition_ids', newSelected);
    };

    const toggleRow = (id) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        router.get(
            '/disbursements/create',
            { search: value },
            {
                preserveState: true,
                replace: true,
                only: ['checkRequisitions', 'filters'],
            }
        );
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setData('files', files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/disbursements', {
            forceFormData: true,
            onSuccess: () => {
                console.log('Disbursement created successfully');
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                // Reset file input on error too
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Clear files from form data
                setData('files', []);
            },
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    // Format date to YYYY-MM-DD in local timezone (avoids UTC conversion issues)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calculateTotals = () => {
        const selectedData = data.filter((cr) => selectedCheckReqs.includes(cr.id));
        const totalAmount = selectedData.reduce((sum, cr) => sum + parseFloat(cr.php_amount || 0), 0);
        const totalInvoices = selectedData.reduce(
            (sum, cr) => sum + (cr.invoices_with_aging?.length || 0),
            0
        );

        return { totalAmount, totalInvoices };
    };

    const totals = calculateTotals();

    return (
        <div className="space-y-6">
            {/* Selection Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Approved Check Requisitions</CardTitle>
                    <CardDescription>
                        Choose one or more approved check requisitions to process for disbursement
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search by requisition number, payee, or PO number..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Selected Summary */}
                    {selectedCheckReqs.length > 0 && (
                        <div className="rounded-md bg-blue-50 p-4">
                            <p className="text-sm font-medium text-blue-900">
                                Selected: {selectedCheckReqs.length} check requisition(s) | {totals.totalInvoices}{' '}
                                invoice(s) | Total: {formatCurrency(totals.totalAmount)}
                            </p>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead className="w-[50px]">Select</TableHead>
                                    <TableHead>CR Number</TableHead>
                                    <TableHead>Payee</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Invoices</TableHead>
                                    <TableHead>Request Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500">
                                            No approved check requisitions available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((checkReq) => (
                                        <React.Fragment key={checkReq.id}>
                                            <TableRow className={selectedCheckReqs.includes(checkReq.id) ? 'bg-blue-50' : ''}>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRow(checkReq.id)}
                                                    >
                                                        {expandedRows.includes(checkReq.id) ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedCheckReqs.includes(checkReq.id)}
                                                        onCheckedChange={() => toggleCheckReq(checkReq.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {checkReq.requisition_number}
                                                </TableCell>
                                                <TableCell>{checkReq.payee_name}</TableCell>
                                                <TableCell>{formatCurrency(checkReq.php_amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {checkReq.invoices_with_aging?.length || 0} invoice(s)
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(checkReq.request_date)}</TableCell>
                                            </TableRow>

                                            {/* Expandable Invoice Details */}
                                            {expandedRows.includes(checkReq.id) && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="bg-gray-50 p-0">
                                                        <div className="p-4">
                                                            <p className="mb-2 text-sm font-semibold text-gray-700">
                                                                Invoices ({checkReq.invoices_with_aging?.length || 0})
                                                            </p>
                                                            <div className="rounded-md border bg-white">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>SI Number</TableHead>
                                                                            <TableHead>Vendor</TableHead>
                                                                            <TableHead>Amount</TableHead>
                                                                            <TableHead>Status</TableHead>
                                                                            <TableHead>Aging (days)</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {checkReq.invoices_with_aging?.map((invoice) => (
                                                                            <TableRow key={invoice.id}>
                                                                                <TableCell className="text-sm">
                                                                                    {invoice.si_number}
                                                                                </TableCell>
                                                                                <TableCell className="text-sm">
                                                                                    {invoice.purchase_order?.vendor?.name || '-'}
                                                                                </TableCell>
                                                                                <TableCell className="text-sm">
                                                                                    {formatCurrency(invoice.net_amount)}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                        {invoice.invoice_status}
                                                                                    </Badge>
                                                                                </TableCell>
                                                                                <TableCell className="text-sm">
                                                                                    {invoice.aging_days !== null ? (
                                                                                        <Badge
                                                                                            variant={
                                                                                                invoice.aging_days > 60
                                                                                                    ? 'destructive'
                                                                                                    : 'outline'
                                                                                            }
                                                                                        >
                                                                                            {invoice.aging_days} days
                                                                                        </Badge>
                                                                                    ) : (
                                                                                        '-'
                                                                                    )}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Disbursement Form */}
            {selectedCheckReqs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Disbursement Details</CardTitle>
                        <CardDescription>Enter the check and disbursement information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="check_voucher_number">
                                        Check Voucher Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="check_voucher_number"
                                        value={formData.check_voucher_number}
                                        onChange={(e) => setData('check_voucher_number', e.target.value)}
                                        required
                                    />
                                    {errors.check_voucher_number && (
                                        <p className="text-sm text-red-500">{errors.check_voucher_number}</p>
                                    )}
                                </div>

                                <DatePicker
                                    label="Date Check Scheduled"
                                    value={formData.date_check_scheduled}
                                    onChange={(date) => {
                                        setData('date_check_scheduled', formatDateForInput(date));
                                    }}
                                    error={errors.date_check_scheduled}
                                    placeholder="Select date"
                                />

                                <DatePicker
                                    label="Date Check Printing"
                                    value={formData.date_check_printing}
                                    onChange={(date) => {
                                        setData('date_check_printing', formatDateForInput(date));
                                    }}
                                    error={errors.date_check_printing}
                                    placeholder="Select date"
                                />

                                <div className="space-y-1">
                                    <DatePicker
                                        label="Date Check Released to Vendor"
                                        value={formData.date_check_released_to_vendor}
                                        onChange={(date) => {
                                            setData('date_check_released_to_vendor', formatDateForInput(date));
                                        }}
                                        error={errors.date_check_released_to_vendor}
                                        placeholder="Select date"
                                    />
                                    <p className="text-xs text-gray-500">
                                        (Stops aging, marks invoices as paid)
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={formData.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="files">Supporting Documents (Optional)</Label>
                                <Input
                                    id="files"
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                />
                                {formData.files && formData.files.length > 0 && (
                                    <p className="text-xs text-blue-600">
                                        {formData.files.length} file(s) selected
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">Upload supporting documents (PDF, JPG, PNG)</p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/disbursements')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Disbursement'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
