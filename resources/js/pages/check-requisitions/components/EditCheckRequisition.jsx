import { DatePicker } from '@/components/custom/DatePicker.jsx';
import { numberToWords } from '@/components/custom/helpers.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, CheckSquare, FileText, Info, Save, Search, Square, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import BackButton from '@/components/custom/BackButton.jsx';

const EditCheckRequisition = ({ checkRequisition, currentInvoices, availableInvoices, filters, filterOptions }) => {
    const [selectedInvoices, setSelectedInvoices] = useState(new Set(currentInvoices?.map((inv) => inv.id) || []));
    const [searchValue, setSearchValue] = useState(filters?.search || '');
    const [vendorFilter, setVendorFilter] = useState(filters?.vendor || 'all');
    const [amountFilter, setAmountFilter] = useState('all');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Combine current and available invoices
    const allInvoices = useMemo(() => {
        const current = currentInvoices || [];
        const available = availableInvoices?.data || [];

        // Create a map to avoid duplicates
        const invoiceMap = new Map();

        [...current, ...available].forEach((inv) => {
            if (!invoiceMap.has(inv.id)) {
                invoiceMap.set(inv.id, inv);
            }
        });

        return Array.from(invoiceMap.values());
    }, [currentInvoices, availableInvoices]);

    const { data, setData, put, processing, errors, reset } = useForm({
        request_date: checkRequisition.request_date,
        payee_name: checkRequisition.payee_name,
        purpose: checkRequisition.purpose,
        po_number: checkRequisition.po_number,
        cer_number: checkRequisition.cer_number || '',
        si_number: checkRequisition.si_number,
        account_charge: checkRequisition.account_charge || '2502',
        service_line_dist: checkRequisition.service_line_dist || 'test',
        php_amount: checkRequisition.php_amount,
        amount_in_words: checkRequisition.amount_in_words,
        requested_by: checkRequisition.requested_by,
        reviewed_by: checkRequisition.reviewed_by || 'JS ORDONEZ / MR ULIT/ JB LABAY',
        approved_by: checkRequisition.approved_by || 'CHRISTOPHER S. BAUTISTA / WILLY N. OCIER',
        invoice_ids: currentInvoices?.map((inv) => inv.id) || [],
    });

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);

    const selectedTotal = useMemo(() => {
        return Array.from(selectedInvoices).reduce((sum, invId) => {
            const invoice = allInvoices.find((inv) => inv.id === invId);
            return sum + Number(invoice?.invoice_amount || invoice?.net_amount || 0);
        }, 0);
    }, [selectedInvoices, allInvoices]);

    const selectedInvoicesList = useMemo(() => {
        return allInvoices.filter((inv) => selectedInvoices.has(inv.id));
    }, [selectedInvoices, allInvoices]);

    // Format SI numbers with range support
    const formatSINumbers = (invoicesList) => {
        if (invoicesList.length === 0) return '';
        if (invoicesList.length <= 5) {
            return invoicesList.map((i) => i.si_number).join(', ');
        }

        const siNumbers = invoicesList.map((i) => i.si_number).sort();
        const first = siNumbers[0];
        const last = siNumbers[siNumbers.length - 1];
        return `${first} - ${last} (${siNumbers.length} invoices)`;
    };

    // Filter invoices by amount
    const filteredInvoices = useMemo(() => {
        let filtered = allInvoices;

        if (amountFilter !== 'all') {
            filtered = filtered.filter((inv) => {
                const amount = inv.invoice_amount || inv.net_amount || 0;
                switch (amountFilter) {
                    case 'under50k':
                        return amount < 50000;
                    case '50k-100k':
                        return amount >= 50000 && amount < 100000;
                    case '100k-500k':
                        return amount >= 100000 && amount < 500000;
                    case 'over500k':
                        return amount >= 500000;
                    default:
                        return true;
                }
            });
        }

        // Apply search filter
        if (searchValue) {
            filtered = filtered.filter((inv) => inv.si_number.toLowerCase().includes(searchValue.toLowerCase()));
        }

        return filtered;
    }, [allInvoices, amountFilter, searchValue]);

    // Statistics
    const statistics = useMemo(() => {
        const total = filteredInvoices.reduce((sum, inv) => sum + Number(inv.invoice_amount || inv.net_amount || 0), 0);
        const avg = filteredInvoices.length > 0 ? total / filteredInvoices.length : 0;

        return { total, avg, count: filteredInvoices.length };
    }, [filteredInvoices]);

    // populate form when selecting invoices
    useEffect(() => {
        if (selectedInvoices.size > 0) {
            const selectedInvs = allInvoices.filter((inv) => selectedInvoices.has(inv.id));
            const firstInvoice = selectedInvs[0];

            const uniqueVendors = new Set(selectedInvs.map((inv) => inv.purchase_order?.vendor?.name || inv.vendor?.name).filter(Boolean));

            const payeeName =
                uniqueVendors.size === 1 ? firstInvoice?.purchase_order?.vendor?.name || firstInvoice?.vendor?.name || '' : 'Multiple Vendors';

            const siNumbersFormatted = formatSINumbers(selectedInvs);

            setData({
                ...data,
                php_amount: selectedTotal,
                amount_in_words: numberToWords(selectedTotal),
                payee_name: payeeName,
                po_number: firstInvoice?.purchase_order?.po_number || '',
                cer_number: firstInvoice?.purchase_order?.project?.cer_number || '',
                si_number: siNumbersFormatted,
                purpose: `Payment for Invoice(s) ${siNumbersFormatted}`,
                invoice_ids: Array.from(selectedInvoices),
            });
        }
    }, [selectedInvoices, selectedTotal]);

    const handleInvoiceToggle = (invoiceId) => {
        setSelectedInvoices((prev) => {
            const newSet = new Set(prev);
            newSet.has(invoiceId) ? newSet.delete(invoiceId) : newSet.add(invoiceId);
            return newSet;
        });
    };

    // Select/Deselect all invoices
    const handleSelectAll = () => {
        if (selectedInvoices.size === filteredInvoices.length) {
            setSelectedInvoices(new Set());
        } else {
            setSelectedInvoices(new Set(filteredInvoices.map((inv) => inv.id)));
        }
    };

    // Validate and show confirmation dialog
    const handleSubmit = () => {
        if (selectedInvoices.size === 0) {
            toast.error('Please select at least one invoice');
            return;
        }

        if (!hasChanges) {
            toast.info('No changes detected');
            return;
        }

        // Show confirmation dialog
        setShowConfirmDialog(true);
    };

    // Submit after confirmation
    const confirmSubmit = () => {
        setShowConfirmDialog(false);

        put(`/check-requisitions/${checkRequisition.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Check requisition updated successfully!');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(error => toast.error(error));
                } else {
                    toast.error('Update failed');
                }
            },
        });
    };

    const allSelected = filteredInvoices.length > 0 && selectedInvoices.size === filteredInvoices.length;

    // Track changes
    const hasChanges = useMemo(() => {
        const originalIds = new Set(currentInvoices?.map((inv) => inv.id) || []);
        const currentIds = selectedInvoices;

        if (originalIds.size !== currentIds.size) return true;

        for (let id of originalIds) {
            if (!currentIds.has(id)) return true;
        }

        return (
            data.payee_name !== checkRequisition.payee_name ||
            data.purpose !== checkRequisition.purpose ||
            data.php_amount !== checkRequisition.php_amount ||
            data.request_date !== checkRequisition.request_date ||
            data.account_charge !== checkRequisition.account_charge ||
            data.service_line_dist !== checkRequisition.service_line_dist
        );
    }, [data, selectedInvoices, currentInvoices, checkRequisition]);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-xl font-semibold text-slate-800">Edit Check Requisition</h1>
                            <p className="text-xs text-slate-500">
                                {checkRequisition.requisition_number} •{hasChanges && <span className="ml-1 text-amber-600">Unsaved changes</span>}
                            </p>
                        </div>
                    </div>
                    {selectedInvoices.size > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs font-medium text-blue-700">
                                {selectedInvoices.size} Selected • {formatCurrency(selectedTotal)}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoices(new Set())} className="text-xs">
                                <X className="mr-1 h-3 w-3" /> Clear
                            </Button>
                        </div>
                    )}
                </div>

                {/* Info Alert */}
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-xs text-blue-800">
                        You are editing an existing check requisition. Changes will be saved when you click "Update Requisition".
                        {currentInvoices?.length > 0 && <span className="ml-1">Currently has {currentInvoices.length} invoice(s) attached.</span>}
                    </AlertDescription>
                </Alert>

                {/* Statistics Bar */}
                <div className="mb-4 grid grid-cols-4 gap-3">
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Available Invoices</p>
                                    <p className="text-sm font-semibold text-slate-800">{statistics.count}</p>
                                </div>
                                <FileText className="h-8 w-8 text-slate-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Total Available</p>
                                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(statistics.total)}</p>
                                </div>
                                <FileText className="h-8 w-8 text-slate-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Selected Count</p>
                                    <p className="text-sm font-semibold text-blue-600">{selectedInvoices.size}</p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-blue-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Selected Total</p>
                                    <p className="text-sm font-semibold text-blue-600">{formatCurrency(selectedTotal)}</p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-blue-300" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Select value={amountFilter} onValueChange={setAmountFilter}>
                        <SelectTrigger className="h-8 w-48 border-slate-200 text-xs">
                            <SelectValue placeholder="Filter by Amount" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Amounts</SelectItem>
                            <SelectItem value="under50k">Under ₱50,000</SelectItem>
                            <SelectItem value="50k-100k">₱50,000 - ₱100,000</SelectItem>
                            <SelectItem value="100k-500k">₱100,000 - ₱500,000</SelectItem>
                            <SelectItem value="over500k">Over ₱500,000</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative max-w-xs flex-1">
                        <Search className="absolute top-2.5 left-2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search invoices..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>

                    <Button variant="outline" size="sm" onClick={handleSelectAll} className="ml-auto h-8 text-xs">
                        {allSelected ? (
                            <>
                                <Square className="mr-1 h-3 w-3" /> Deselect All
                            </>
                        ) : (
                            <>
                                <CheckSquare className="mr-1 h-3 w-3" /> Select All
                            </>
                        )}
                    </Button>
                </div>

                {/* Grid */}
                <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
                    {/* Left: Invoice list */}
                    <Card className="border-slate-100 shadow-none">
                        <CardHeader className="border-b border-slate-100 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-700">Available Invoices</h3>
                                    <p className="text-xs text-slate-400">{filteredInvoices.length || 0} record(s)</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {selectedInvoices.size}/{filteredInvoices.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[calc(100vh-400px)]">
                                {filteredInvoices.length === 0 ? (
                                    <div className="py-10 text-center text-sm text-slate-500">
                                        <FileText className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                                        No invoices found
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredInvoices.map((inv) => {
                                            const isSelected = selectedInvoices.has(inv.id);
                                            const isOriginal = currentInvoices?.some((ci) => ci.id === inv.id);
                                            return (
                                                <div
                                                    key={inv.id}
                                                    onClick={() => handleInvoiceToggle(inv.id)}
                                                    className={`cursor-pointer p-3 transition-all ${
                                                        isSelected ? 'border-l-2 border-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium text-slate-800">SI# {inv.si_number}</p>
                                                                {isOriginal && (
                                                                    <Badge variant="outline" className="border-green-300 bg-green-50 text-xs">
                                                                        Current
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="truncate text-xs text-slate-500">
                                                                {inv.purchase_order?.vendor?.name || inv.vendor?.name}
                                                            </p>
                                                            <div className="mt-1 flex items-center justify-between">
                                                                <p className="text-xs font-medium text-slate-700">
                                                                    {formatCurrency(inv.invoice_amount || inv.net_amount || 0)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isSelected && <Check className="ml-2 h-4 w-4 flex-shrink-0 text-blue-600" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Right: Form */}
                    <Card className="border-slate-100 shadow-none">
                        <CardHeader className="border-b border-slate-100 pb-2">
                            <h2 className="text-sm font-semibold text-slate-700">Requisition Details</h2>
                        </CardHeader>
                        <CardContent className="pt-3">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <DatePicker label="Request Date" value={data.request_date} onChange={(value) => setData('request_date', value)} />
                                    <div>
                                        <Label className="text-xs">PHP Amount</Label>
                                        <Input readOnly value={formatCurrency(data.php_amount)} className="bg-slate-50 text-sm font-semibold" />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs">Payee Name</Label>
                                    <Input value={data.payee_name} onChange={(e) => setData('payee_name', e.target.value)} className="text-sm" />
                                    {errors.payee_name && <p className="mt-1 text-xs text-red-600">{errors.payee_name}</p>}
                                </div>

                                <div>
                                    <Label className="text-xs">Purpose</Label>
                                    <Textarea
                                        rows={2}
                                        value={data.purpose}
                                        onChange={(e) => setData('purpose', e.target.value)}
                                        className="text-sm"
                                    />
                                    {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {['po_number', 'cer_number', 'si_number'].map((field) => (
                                        <div key={field}>
                                            <Label className="text-xs capitalize">{field.replace('_', ' ')}</Label>
                                            <Input value={data[field]} onChange={(e) => setData(field, e.target.value)} className="text-sm" />
                                            {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Account Charge</Label>
                                        <Input
                                            value={data.account_charge}
                                            onChange={(e) => setData('account_charge', e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Service Line Distribution</Label>
                                        <Input
                                            value={data.service_line_dist}
                                            onChange={(e) => setData('service_line_dist', e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs">Amount in Words</Label>
                                    <Input readOnly value={data.amount_in_words} className="bg-slate-50 text-sm" />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {['requested_by', 'reviewed_by', 'approved_by'].map((f) => (
                                        <div key={f}>
                                            <Label className="text-xs capitalize">{f.replace('_', ' ')}</Label>
                                            <Input value={data[f]} onChange={(e) => setData(f, e.target.value)} className="text-sm" />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={selectedInvoices.size === 0 || processing || !hasChanges}
                                        className="h-9 flex-1 bg-blue-600 text-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <svg
                                                    className="mr-2 h-4 w-4 animate-spin"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Update Requisition
                                            </>
                                        )}
                                    </Button>
                                    <Link href={`/check-requisitions/${checkRequisition.id}`}>
                                        <Button variant="outline" className="h-9 text-sm" disabled={processing}>
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>

                                {!hasChanges && selectedInvoices.size > 0 && (
                                    <p className="text-center text-xs text-slate-500">No changes detected</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>Are you sure you want to update this check requisition?</p>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Requisition #:</span>
                                    <span>{checkRequisition.requisition_number}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Payee:</span>
                                    <span>{data.payee_name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Amount:</span>
                                    <span className="font-semibold text-blue-600">{formatCurrency(data.php_amount)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Invoices:</span>
                                    <span>{selectedInvoices.size} selected</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Date:</span>
                                    <span>{data.request_date}</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSubmit}
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Updating...' : 'Confirm & Update'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EditCheckRequisition;
