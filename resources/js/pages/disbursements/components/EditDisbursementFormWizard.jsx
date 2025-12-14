import { useState, useRef, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, AlertTriangle, Loader2, CheckCircle2, XCircle, ArrowLeft, ArrowRight, FileText, Download, Eye, Paperclip, Calendar, User } from 'lucide-react';
import { DatePicker } from '@/components/custom/DatePicker';
import StatusBadge, { AgingBadge } from '@/components/custom/StatusBadge';
import DisbursementWizardStepper from './DisbursementWizardStepper';
import DisbursementFinancialPreview from './DisbursementFinancialPreview';
import FileUpload from '@/components/custom/FileUpload';
import DisbursementReviewStep from './DisbursementReviewStep';

export default function EditDisbursementFormWizard({
    disbursement,
    currentCheckRequisitions,
    availableCheckRequisitions,
    filters
}) {
    const { data: availableData = [] } = availableCheckRequisitions || {};
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCheckReqs, setSelectedCheckReqs] = useState(
        currentCheckRequisitions.map(cr => cr.id)
    );
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [payeeFilter, setPayeeFilter] = useState('all');
    const [agingFilter, setAgingFilter] = useState('all');
    const [voucherCheckStatus, setVoucherCheckStatus] = useState(null);
    const [showNoSelectionWarning, setShowNoSelectionWarning] = useState(false);
    const [dateValidationErrors, setDateValidationErrors] = useState({});
    const voucherCheckTimeout = useRef(null);

    const { data: formData, setData, post, processing, errors } = useForm({
        check_voucher_number: disbursement.check_voucher_number || '',
        date_check_scheduled: disbursement.date_check_scheduled || '',
        date_check_released_to_vendor: disbursement.date_check_released_to_vendor || '',
        date_check_printing: disbursement.date_check_printing || '',
        remarks: disbursement.remarks || '',
        check_requisition_ids: selectedCheckReqs,
        files: [],
        _method: 'POST',
    });

    // Track changes
    const originalCRIds = currentCheckRequisitions.map(cr => cr.id);
    const removedCRIds = originalCRIds.filter(id => !selectedCheckReqs.includes(id));
    const addedCRIds = selectedCheckReqs.filter(id => !originalCRIds.includes(id));

    const steps = [
        { title: 'Manage CRs', description: 'Add/remove requisitions' },
        { title: 'Edit Details', description: 'Update disbursement info' },
        { title: 'Review', description: 'Confirm changes' },
    ];

    // Toggle check requisition selection
    const toggleCheckReq = (checkReqId) => {
        const newSelected = selectedCheckReqs.includes(checkReqId)
            ? selectedCheckReqs.filter((id) => id !== checkReqId)
            : [...selectedCheckReqs, checkReqId];

        setSelectedCheckReqs(newSelected);
        setData('check_requisition_ids', newSelected);
    };

    // Select all check requisitions
    const selectAllCheckReqs = () => {
        const filteredIds = getFilteredData().map(cr => cr.id);
        setSelectedCheckReqs(filteredIds);
        setData('check_requisition_ids', filteredIds);
    };

    // Clear all selections
    const clearAllSelections = () => {
        setSelectedCheckReqs([]);
        setData('check_requisition_ids', []);
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        router.get(
            `/disbursements/${disbursement.id}/edit`,
            { search: value },
            {
                preserveState: true,
                replace: true,
                only: ['availableCheckRequisitions', 'filters'],
            }
        );
    };

    // Get unique payees for filter
    const uniquePayees = [...new Set(availableData.map(cr => cr.payee_name).filter(Boolean))].sort();

    // Filter data based on search and filters
    const getFilteredData = () => {
        return availableData.filter(cr => {
            // Payee filter
            if (payeeFilter !== 'all' && cr.payee_name !== payeeFilter) {
                return false;
            }

            // Aging filter
            if (agingFilter !== 'all') {
                const maxAging = cr.invoices_with_aging?.reduce((max, inv) =>
                    Math.max(max, inv.aging_days || 0), 0) || 0;

                if (agingFilter === 'low' && maxAging > 30) return false;
                if (agingFilter === 'medium' && (maxAging <= 30 || maxAging > 60)) return false;
                if (agingFilter === 'high' && maxAging <= 60) return false;
            }

            return true;
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to get whole number aging days
    const getAgingDays = (days) => {
        return days != null ? Math.floor(days) : null;
    };

    // Helper function to handle file preview
    const handleFilePreview = (fileUrl) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    };

    // Real-time uniqueness check for check voucher number (excluding current disbursement)
    useEffect(() => {
        // If voucher number is the same as the original, no need to check
        if (formData.check_voucher_number === disbursement.check_voucher_number) {
            setVoucherCheckStatus(null);
            return;
        }

        if (!formData.check_voucher_number) {
            setVoucherCheckStatus(null);
            return;
        }

        if (voucherCheckTimeout.current) {
            clearTimeout(voucherCheckTimeout.current);
        }

        setVoucherCheckStatus('checking');

        voucherCheckTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/api/disbursements/check-voucher-unique?voucher_number=${encodeURIComponent(formData.check_voucher_number)}&exclude_id=${disbursement.id}`
                );
                const data = await response.json();
                setVoucherCheckStatus(data.available ? 'available' : 'unavailable');
            } catch (error) {
                console.error('Error checking voucher uniqueness:', error);
                setVoucherCheckStatus(null);
            }
        }, 500);

        return () => {
            if (voucherCheckTimeout.current) {
                clearTimeout(voucherCheckTimeout.current);
            }
        };
    }, [formData.check_voucher_number, disbursement.check_voucher_number, disbursement.id]);

    // Validate date sequence
    useEffect(() => {
        const errors = {};

        if (formData.date_check_scheduled && formData.date_check_printing) {
            const scheduled = new Date(formData.date_check_scheduled);
            const printing = new Date(formData.date_check_printing);

            if (scheduled < printing) {
                errors.date_check_scheduled = 'Scheduled date should be after printing date';
            }
        }

        if (formData.date_check_released_to_vendor && formData.date_check_scheduled) {
            const released = new Date(formData.date_check_released_to_vendor);
            const scheduled = new Date(formData.date_check_scheduled);

            if (released < scheduled) {
                errors.date_check_released_to_vendor = 'Release date should be after scheduled date';
            }
        }

        setDateValidationErrors(errors);
    }, [formData.date_check_printing, formData.date_check_scheduled, formData.date_check_released_to_vendor]);

    const goToNextStep = () => {
        if (currentStep === 1 && selectedCheckReqs.length === 0) {
            setShowNoSelectionWarning(true);
            return;
        }

        setShowNoSelectionWarning(false);

        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step) => {
        setCurrentStep(step);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Only allow submission on step 3 (review)
        if (currentStep !== 3) {
            return;
        }

        if (processing) {
            return;
        }

        if (voucherCheckStatus === 'unavailable') {
            alert('The voucher number is already in use. Please enter a different number.');
            setCurrentStep(2);
            return;
        }

        if (voucherCheckStatus === 'checking') {
            alert('Please wait while we verify the voucher number availability.');
            return;
        }

        if (selectedCheckReqs.length === 0) {
            setShowNoSelectionWarning(true);
            setCurrentStep(1);
            return;
        }

        if (Object.keys(dateValidationErrors).length > 0) {
            alert('Please fix date validation errors before submitting');
            setCurrentStep(2);
            return;
        }

        post(`/disbursements/${disbursement.id}`, {
            forceFormData: true,
            onError: (errors) => {
                console.error('Validation errors:', errors);
                setData('files', []);
                setCurrentStep(2);
            },
        });
    };

    const getCRBadge = (crId) => {
        if (removedCRIds.includes(crId)) {
            return <Badge variant="destructive" className="ml-2 text-xs">Will be removed</Badge>;
        }
        if (addedCRIds.includes(crId)) {
            return <Badge className="ml-2 bg-green-600 text-xs">Will be added</Badge>;
        }
        if (originalCRIds.includes(crId)) {
            return <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>;
        }
        return null;
    };

    const filteredData = getFilteredData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Stepper */}
                <DisbursementWizardStepper currentStep={currentStep} steps={steps} />

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-8">
                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <form
                                    onSubmit={handleSubmit}
                                    onKeyDown={(e) => {
                                        // Prevent Enter key from submitting form on steps 1 and 2
                                        if (e.key === 'Enter' && currentStep !== 3) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    {/* Step 1: Manage Check Requisitions */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Manage Check Requisitions</h2>
                                                <p className="mt-2 text-sm text-slate-600">
                                                    Add or remove check requisitions from this disbursement
                                                </p>
                                            </div>

                                            {/* Change Warnings */}
                                            {removedCRIds.length > 0 && (
                                                <Alert variant="destructive">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        Removing {removedCRIds.length} check requisition(s) will revert their status to 'approved' and associated invoices to 'approved'.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {addedCRIds.length > 0 && (
                                                <Alert>
                                                    <AlertDescription>
                                                        Adding {addedCRIds.length} check requisition(s) will mark them as 'processed'.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Filters and Search */}
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        placeholder="Search by CR number or payee..."
                                                        value={searchQuery}
                                                        onChange={(e) => handleSearch(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        className="pl-10"
                                                    />
                                                </div>

                                                <Select value={payeeFilter} onValueChange={setPayeeFilter}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Filter by payee" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Payees</SelectItem>
                                                        {uniquePayees.map((payee) => (
                                                            <SelectItem key={payee} value={payee}>
                                                                {payee}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select value={agingFilter} onValueChange={setAgingFilter}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Filter by aging" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Aging</SelectItem>
                                                        <SelectItem value="low">Low (&lt; 30 days)</SelectItem>
                                                        <SelectItem value="medium">Medium (30-60 days)</SelectItem>
                                                        <SelectItem value="high">High (&gt; 60 days)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Bulk Actions */}
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-slate-600">
                                                    {selectedCheckReqs.length} of {filteredData.length} selected
                                                    {(removedCRIds.length > 0 || addedCRIds.length > 0) && (
                                                        <span className="ml-2 text-blue-600">
                                                            ({addedCRIds.length} added, {removedCRIds.length} removed)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={selectAllCheckReqs}
                                                    >
                                                        Select All
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={clearAllSelections}
                                                    >
                                                        Clear All
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* No Selection Warning */}
                                            {showNoSelectionWarning && (
                                                <Alert variant="destructive">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        Please select at least one check requisition before proceeding.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {/* CR Cards */}
                                            <div className="space-y-3">
                                                {filteredData.length === 0 ? (
                                                    <Card>
                                                        <CardContent className="py-12 text-center text-slate-500">
                                                            <FileText className="mx-auto h-12 w-12 text-slate-300" />
                                                            <p className="mt-2">No check requisitions found</p>
                                                        </CardContent>
                                                    </Card>
                                                ) : (
                                                    filteredData.map((checkReq) => {
                                                        const isSelected = selectedCheckReqs.includes(checkReq.id);
                                                        const isRemoved = removedCRIds.includes(checkReq.id);
                                                        const isAdded = addedCRIds.includes(checkReq.id);

                                                        return (
                                                            <Card
                                                                key={checkReq.id}
                                                                className={`transition-all duration-200 ${
                                                                    isRemoved
                                                                        ? 'border-red-500 bg-red-50/50 shadow-md ring-1 ring-red-200'
                                                                        : isAdded
                                                                        ? 'border-green-500 bg-green-50/50 shadow-md ring-1 ring-green-200'
                                                                        : isSelected
                                                                        ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-200'
                                                                        : 'hover:border-slate-300 hover:shadow-sm'
                                                                }`}
                                                            >
                                                                <CardContent className="p-3">
                                                                    <div className="flex items-start gap-3">
                                                                        {/* Checkbox */}
                                                                        <div className="pt-0.5">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => toggleCheckReq(checkReq.id)}
                                                                                className="h-4 w-4"
                                                                            />
                                                                        </div>

                                                                        {/* Main Content */}
                                                                        <div className="flex-1 min-w-0 space-y-2">
                                                                            {/* Header: CR Number, Status, Amount */}
                                                                            <div className="flex items-center justify-between gap-3">
                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                    <h3 className="text-sm font-bold text-blue-600">
                                                                                        {checkReq.requisition_number}
                                                                                    </h3>
                                                                                    <StatusBadge
                                                                                        status="approved"
                                                                                        size="sm"
                                                                                        showIcon={true}
                                                                                    />
                                                                                    {getCRBadge(checkReq.id)}
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <div className="text-lg font-bold text-green-600">
                                                                                        {formatCurrency(checkReq.php_amount)}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Payee Name */}
                                                                            <div className="text-sm font-semibold text-slate-900">
                                                                                {checkReq.payee_name}
                                                                            </div>

                                                                            {/* Dates and Counts */}
                                                                            <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600">
                                                                                <div className="flex items-center gap-1">
                                                                                    <Calendar className="h-3 w-3" />
                                                                                    <span>Req: {formatDate(checkReq.request_date)}</span>
                                                                                </div>
                                                                                {checkReq.approved_at && (
                                                                                    <>
                                                                                        <span className="text-slate-300">•</span>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                                            <span>Approved: {formatDate(checkReq.approved_at)}</span>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                                <span className="text-slate-300">•</span>
                                                                                <Badge variant="outline" className="text-xs py-0 px-1.5">
                                                                                    {checkReq.invoices_with_aging?.length || 0} inv
                                                                                </Badge>
                                                                                {checkReq.approval_files && checkReq.approval_files.length > 0 && (
                                                                                    <>
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="text-xs py-0 px-1.5 cursor-pointer hover:bg-slate-100"
                                                                                            onClick={() => handleFilePreview(checkReq.approval_files[0]?.file_url)}
                                                                                        >
                                                                                            <Paperclip className="h-2.5 w-2.5 mr-0.5" />
                                                                                            {checkReq.approval_files.length}
                                                                                        </Badge>
                                                                                    </>
                                                                                )}
                                                                            </div>

                                                                            {/* Invoices List - Compact */}
                                                                            {checkReq.invoices_with_aging && checkReq.invoices_with_aging.length > 0 && (
                                                                                <div className="mt-2 space-y-1">
                                                                                    <div className="text-[10px] font-semibold uppercase text-slate-500 tracking-wide">
                                                                                        Invoices
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        {checkReq.invoices_with_aging.map((invoice) => {
                                                                                            const agingDays = getAgingDays(invoice.aging_days);
                                                                                            return (
                                                                                                <div
                                                                                                    key={invoice.id}
                                                                                                    className="flex items-center justify-between gap-2 rounded bg-white border border-slate-200 px-2 py-1.5 hover:border-slate-300 transition-colors"
                                                                                                >
                                                                                                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                                                                                                        <span className="text-xs font-semibold text-slate-900">
                                                                                                            {invoice.si_number}
                                                                                                        </span>
                                                                                                        <StatusBadge
                                                                                                            status={invoice.invoice_status}
                                                                                                            size="xs"
                                                                                                            showIcon={false}
                                                                                                        />
                                                                                                        {agingDays !== null && (
                                                                                                            <Badge
                                                                                                                variant={agingDays > 60 ? 'destructive' : agingDays > 30 ? 'default' : 'outline'}
                                                                                                                className="text-[10px] py-0 px-1 h-4"
                                                                                                            >
                                                                                                                {agingDays}d
                                                                                                            </Badge>
                                                                                                        )}
                                                                                                        <span className="text-[10px] text-slate-500 truncate">
                                                                                                            {invoice.purchase_order?.vendor?.name || 'Unknown'}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="text-xs font-bold text-slate-900 whitespace-nowrap">
                                                                                                        {formatCurrency(invoice.net_amount)}
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Edit Details */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Edit Disbursement Details</h2>
                                                <p className="mt-2 text-sm text-slate-600">
                                                    Update the check and disbursement information
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="check_voucher_number">
                                                        Check Voucher Number (Optional)
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="check_voucher_number"
                                                            value={formData.check_voucher_number}
                                                            onChange={(e) => setData('check_voucher_number', e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            placeholder="Enter check voucher number or leave blank for auto-generation"
                                                            className={`${
                                                                voucherCheckStatus === 'unavailable' ? 'pr-10 border-red-500' :
                                                                voucherCheckStatus === 'available' ? 'pr-10 border-green-500' :
                                                                voucherCheckStatus === 'checking' ? 'pr-10' : ''
                                                            }`}
                                                        />
                                                        {voucherCheckStatus && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                {voucherCheckStatus === 'checking' && (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                                )}
                                                                {voucherCheckStatus === 'available' && (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                )}
                                                                {voucherCheckStatus === 'unavailable' && (
                                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {errors.check_voucher_number && (
                                                        <p className="text-sm text-red-500">{errors.check_voucher_number}</p>
                                                    )}
                                                    {voucherCheckStatus === 'unavailable' && (
                                                        <p className="text-sm text-red-500">This voucher number is already in use</p>
                                                    )}
                                                    {voucherCheckStatus === 'available' && (
                                                        <p className="text-sm text-green-600">Voucher number is available</p>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <DatePicker
                                                        label="Date Check Printing"
                                                        value={formData.date_check_printing}
                                                        onChange={(date) => {
                                                            setData('date_check_printing', formatDateForInput(date));
                                                        }}
                                                        error={errors.date_check_printing}
                                                        placeholder="Select date"
                                                    />
                                                    <p className="text-xs text-gray-500">
                                                        When the physical check is generated and printed
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <DatePicker
                                                        label="Date Scheduled for Release"
                                                        value={formData.date_check_scheduled}
                                                        onChange={(date) => {
                                                            setData('date_check_scheduled', formatDateForInput(date));
                                                        }}
                                                        error={errors.date_check_scheduled || dateValidationErrors.date_check_scheduled}
                                                        placeholder="Select date"
                                                    />
                                                    {dateValidationErrors.date_check_scheduled && (
                                                        <p className="text-xs text-red-500">{dateValidationErrors.date_check_scheduled}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        When the check is scheduled to be released
                                                    </p>
                                                </div>

                                                <div className="space-y-1 md:col-span-2">
                                                    <DatePicker
                                                        label="Date Check Released to Vendor"
                                                        value={formData.date_check_released_to_vendor}
                                                        onChange={(date) => {
                                                            setData('date_check_released_to_vendor', formatDateForInput(date));
                                                        }}
                                                        error={errors.date_check_released_to_vendor || dateValidationErrors.date_check_released_to_vendor}
                                                        placeholder="Select date"
                                                    />
                                                    {dateValidationErrors.date_check_released_to_vendor && (
                                                        <p className="text-xs text-red-500">{dateValidationErrors.date_check_released_to_vendor}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        Actual handover of the check (stops aging, marks invoices as paid)
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
                                                    placeholder="Add any additional notes or remarks"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <FileUpload
                                                    files={formData.files}
                                                    onChange={(files) => setData('files', files)}
                                                    existingFiles={disbursement.files || []}
                                                    onDownloadFile={(file) => window.open(`/storage/${file.file_path}`, '_blank')}
                                                    label="Supporting Documents (Optional)"
                                                    description="PDF, JPG, PNG (Max 10MB). New files will be added to existing attachments."
                                                    variant="compact"
                                                    maxFiles={10}
                                                    maxSizePerFile={10}
                                                    accept={['.pdf', '.jpg', '.jpeg', '.png']}
                                                    error={errors?.files}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Review */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Review Changes</h2>
                                                <p className="mt-2 text-sm text-slate-600">
                                                    Review your changes before updating the disbursement
                                                </p>
                                            </div>

                                            {/* Change Summary */}
                                            {(removedCRIds.length > 0 || addedCRIds.length > 0) && (
                                                <Alert>
                                                    <AlertDescription>
                                                        <div className="space-y-1">
                                                            <p className="font-semibold">Changes Summary:</p>
                                                            {addedCRIds.length > 0 && (
                                                                <p className="text-green-700">• {addedCRIds.length} check requisition(s) will be added</p>
                                                            )}
                                                            {removedCRIds.length > 0 && (
                                                                <p className="text-red-700">• {removedCRIds.length} check requisition(s) will be removed</p>
                                                            )}
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Reuse the review step component */}
                                            <DisbursementReviewStep
                                                formData={formData}
                                                selectedCheckReqs={selectedCheckReqs}
                                                allCheckReqs={availableData}
                                                files={formData.files}
                                                existingFiles={disbursement.files}
                                                onEdit={goToStep}
                                                isEditMode={true}
                                                removedCount={removedCRIds.length}
                                                addedCount={addedCRIds.length}
                                            />
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="mt-8 flex items-center justify-between border-t pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={goToPreviousStep}
                                            disabled={currentStep === 1}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Previous
                                        </Button>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit(`/disbursements/${disbursement.id}`)}
                                            >
                                                Cancel
                                            </Button>

                                            {currentStep < steps.length ? (
                                                <Button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        goToNextStep();
                                                    }}
                                                >
                                                    Next
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        voucherCheckStatus === 'unavailable' ||
                                                        voucherCheckStatus === 'checking' ||
                                                        Object.keys(dateValidationErrors).length > 0
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        'Update Disbursement'
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Financial Preview Sidebar */}
                    <div className="lg:col-span-4">
                        <DisbursementFinancialPreview
                            selectedCheckReqs={selectedCheckReqs}
                            allCheckReqs={availableData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
