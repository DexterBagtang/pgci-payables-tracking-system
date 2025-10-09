import React, { useState, useEffect, useMemo } from "react";
import {
    Check,
    FileText,
    Search,
    Save,
    X,
    AlertCircle,
    CheckSquare,
    Square,
    Download,
    Filter,
    Calendar,
    DollarSign,
    TrendingUp,
    Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { router, useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { numberToWords } from "@/components/custom/helpers.jsx";
import { DatePicker } from "@/components/custom/DatePicker.jsx";
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert";

const CheckRequisitionForm = ({ invoices, filters, filterOptions }) => {
    const [selectedInvoices, setSelectedInvoices] = useState(new Set());
    const [searchValue, setSearchValue] = useState(filters?.search || "");
    const [vendorFilter, setVendorFilter] = useState(filters?.vendor || "all");
    const [amountFilter, setAmountFilter] = useState("all");
    const [showValidation, setShowValidation] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        request_date: new Date().toISOString().split("T")[0],
        payee_name: "",
        purpose: "",
        po_number: "",
        cer_number: "",
        si_number: "",
        account_charge: "2502",
        service_line_dist: "test",
        php_amount: 0,
        amount_in_words: "",
        requested_by: "KA. USONA / JL. MADERAZO",
        reviewed_by: "JS ORDONEZ / MR ULIT/ JB LABAY",
        approved_by: "CHRISTOPHER S. BAUTISTA / WILLY N. OCIER",
        invoice_ids: [],
    });

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);

    const selectedTotal = useMemo(() => {
        return Array.from(selectedInvoices).reduce((sum, invId) => {
            const invoice = invoices?.data?.find((inv) => inv.id === invId);
            return sum + (invoice?.invoice_amount || 0);
        }, 0);
    }, [selectedInvoices, invoices]);

    const selectedInvoicesList = useMemo(() => {
        return invoices?.data?.filter((inv) => selectedInvoices.has(inv.id)) || [];
    }, [selectedInvoices, invoices]);

    // Format SI numbers with range support
    const formatSINumbers = (invoicesList) => {
        if (invoicesList.length === 0) return "";
        if (invoicesList.length <= 5) {
            return invoicesList.map((i) => i.si_number).join(", ");
        }

        const siNumbers = invoicesList.map((i) => i.si_number).sort();
        const first = siNumbers[0];
        const last = siNumbers[siNumbers.length - 1];
        return `${first} - ${last} (${siNumbers.length} invoices)`;
    };

    // Filter invoices by amount
    const filteredInvoices = useMemo(() => {
        let filtered = invoices?.data || [];

        if (amountFilter !== "all") {
            filtered = filtered.filter((inv) => {
                const amount = inv.invoice_amount;
                switch (amountFilter) {
                    case "under50k":
                        return amount < 50000;
                    case "50k-100k":
                        return amount >= 50000 && amount < 100000;
                    case "100k-500k":
                        return amount >= 100000 && amount < 500000;
                    case "over500k":
                        return amount >= 500000;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [invoices, amountFilter]);

    // Statistics
    const statistics = useMemo(() => {
        const total = filteredInvoices.reduce((sum, inv) => sum + inv.invoice_amount, 0);
        const avg = filteredInvoices.length > 0 ? total / filteredInvoices.length : 0;
        const max = Math.max(...filteredInvoices.map(inv => inv.invoice_amount), 0);
        const min = filteredInvoices.length > 0 ? Math.min(...filteredInvoices.map(inv => inv.invoice_amount)) : 0;

        return { total, avg, max, min, count: filteredInvoices.length };
    }, [filteredInvoices]);

    // Validation checks
    const validationIssues = useMemo(() => {
        const issues = [];
        const vendorSet = new Set(selectedInvoicesList.map(inv => inv.purchase_order?.vendor?.id));

        if (vendorSet.size > 1) {
            issues.push("Multiple vendors selected - verify consolidation is allowed");
        }

        if (selectedTotal > 1000000) {
            issues.push("Total amount exceeds ₱1M - may require additional approval");
        }

        const hasMissingPO = selectedInvoicesList.some(inv => !inv.purchase_order?.po_number);
        if (hasMissingPO) {
            issues.push("Some invoices have missing PO numbers");
        }

        return issues;
    }, [selectedInvoicesList, selectedTotal]);

    // debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue || searchValue === "") {
                handleFilterChange({ search: searchValue, page: 1 });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // populate form when selecting invoices
    useEffect(() => {
        if (selectedInvoices.size > 0) {
            const selectedInvs =
                invoices?.data?.filter((inv) => selectedInvoices.has(inv.id)) || [];
            const firstInvoice = selectedInvs[0];

            const uniqueVendors = new Set(
                selectedInvs.map((inv) => inv.purchase_order?.vendor?.name).filter(Boolean)
            );

            const payeeName =
                uniqueVendors.size === 1
                    ? firstInvoice?.purchase_order?.vendor?.name || ""
                    : "Multiple Vendors";

            const siNumbersFormatted = formatSINumbers(selectedInvs);

            setData({
                ...data,
                php_amount: selectedTotal,
                amount_in_words: numberToWords(selectedTotal),
                payee_name: payeeName,
                po_number: firstInvoice?.purchase_order?.po_number || "",
                cer_number: firstInvoice?.purchase_order?.project?.cer_number || "",
                si_number: siNumbersFormatted,
                purpose: `Payment for Invoice(s) ${siNumbersFormatted}`,
                invoice_ids: Array.from(selectedInvoices),
            });
        }
    }, [selectedInvoices, selectedTotal]);

    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        Object.keys(updatedFilters).forEach((key) => {
            if (!updatedFilters[key] || updatedFilters[key] === "all") {
                delete updatedFilters[key];
            }
        });

        router.get("/check-requisitions/create", updatedFilters, {
            preserveState: true,
            preserveScroll: true,
            only: ["invoices"],
        });
    };

    const handleVendorChange = (value) => {
        setVendorFilter(value);
        handleFilterChange({ vendor: value, page: 1 });
    };

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
            setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
        }
    };

    // Select by vendor
    const handleSelectByVendor = (vendorId) => {
        const vendorInvoices = filteredInvoices.filter(
            inv => inv.purchase_order?.vendor?.id === vendorId
        );
        const newSet = new Set(selectedInvoices);
        vendorInvoices.forEach(inv => newSet.add(inv.id));
        setSelectedInvoices(newSet);
    };

    // Copy to clipboard
    const handleCopyDetails = () => {
        const details = `
Check Requisition Details
Date: ${data.request_date}
Payee: ${data.payee_name}
Amount: ${formatCurrency(data.php_amount)}
Purpose: ${data.purpose}
SI Numbers: ${data.si_number}
PO Number: ${data.po_number}
CER Number: ${data.cer_number}
        `.trim();

        navigator.clipboard.writeText(details);
        toast.success("Details copied to clipboard");
    };

    // Export selected invoices
    const handleExportCSV = () => {
        const csvContent = [
            ["SI Number", "Vendor", "Amount", "PO Number", "Date"],
            ...selectedInvoicesList.map(inv => [
                inv.si_number,
                inv.purchase_order?.vendor?.name || "",
                inv.invoice_amount,
                inv.purchase_order?.po_number || "",
                inv.invoice_date || ""
            ])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `check-requisition-${Date.now()}.csv`;
        a.click();
        toast.success("CSV exported successfully");
    };

    const handleSubmit = () => {
        if (selectedInvoices.size === 0) {
            toast.error("Please select at least one invoice");
            return;
        }

        if (validationIssues.length > 0) {
            setShowValidation(true);
            toast.warning("Please review validation warnings before submitting");
            return;
        }

        post("/check-requisitions", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Check requisition created successfully!");
                setSelectedInvoices(new Set());
                setShowValidation(false);
                reset();
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || "Submission failed");
            },
        });
    };

    const allSelected = filteredInvoices.length > 0 && selectedInvoices.size === filteredInvoices.length;

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">
                            Check Requisition
                        </h1>
                        <p className="text-xs text-slate-500">
                            Select approved invoices and generate a request
                        </p>
                    </div>
                    {selectedInvoices.size > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium"
                            >
                                {selectedInvoices.size} Selected • {formatCurrency(selectedTotal)}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyDetails}
                                className="text-xs h-8"
                            >
                                <Copy className="mr-1 h-3 w-3" /> Copy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportCSV}
                                className="text-xs h-8"
                            >
                                <Download className="mr-1 h-3 w-3" /> Export
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedInvoices(new Set())}
                                className="text-xs h-8"
                            >
                                <X className="mr-1 h-3 w-3" /> Clear
                            </Button>
                        </div>
                    )}
                </div>

                {/* Statistics Bar */}
                <div className="mb-4 grid grid-cols-4 gap-3">
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Total Available</p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {formatCurrency(statistics.total)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-slate-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Average Amount</p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {formatCurrency(statistics.avg)}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-slate-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Invoice Count</p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {statistics.count}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-slate-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">Selected Total</p>
                                    <p className="text-sm font-semibold text-blue-600">
                                        {formatCurrency(selectedTotal)}
                                    </p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-blue-300" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Select value={vendorFilter} onValueChange={handleVendorChange}>
                        <SelectTrigger className="h-8 w-48 text-xs border-slate-200">
                            <SelectValue placeholder="All Vendors" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Vendors</SelectItem>
                            {filterOptions?.vendors?.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                    {vendor.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={amountFilter} onValueChange={setAmountFilter}>
                        <SelectTrigger className="h-8 w-48 text-xs border-slate-200">
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

                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search invoices..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-8 h-8 text-xs"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-8 text-xs ml-auto"
                    >
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

                {/* Validation Warnings */}
                {showValidation && validationIssues.length > 0 && (
                    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-xs text-yellow-800">
                            <ul className="list-disc pl-4 space-y-1">
                                {validationIssues.map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Grid */}
                <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
                    {/* Left: Invoice list */}
                    <Card className="border-slate-100 shadow-none">
                        <CardHeader className="border-b border-slate-100 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-700">
                                        Approved Invoices
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {filteredInvoices.length || 0} record(s)
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {selectedInvoices.size}/{filteredInvoices.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[calc(100vh-400px)]">
                                {filteredInvoices.length === 0 ? (
                                    <div className="py-10 text-center text-slate-500 text-sm">
                                        <FileText className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                                        No invoices found
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredInvoices.map((inv) => {
                                            const isSelected = selectedInvoices.has(inv.id);
                                            return (
                                                <div
                                                    key={inv.id}
                                                    onClick={() => handleInvoiceToggle(inv.id)}
                                                    className={`p-3 cursor-pointer transition-all ${
                                                        isSelected
                                                            ? "bg-blue-50 border-l-2 border-blue-500"
                                                            : "hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-slate-800">
                                                                SI# {inv.si_number}
                                                            </p>
                                                            <p className="text-xs text-slate-500 truncate">
                                                                {inv.purchase_order?.vendor?.name || inv.vendor?.name}
                                                            </p>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <p className="text-xs font-medium text-slate-700">
                                                                    {formatCurrency(inv.invoice_amount)}
                                                                </p>
                                                                {inv.purchase_order?.po_number && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        PO: {inv.purchase_order.po_number}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                                                        )}
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
                        <CardHeader className="pb-2 border-b border-slate-100">
                            <h2 className="text-sm font-semibold text-slate-700">
                                Requisition Details
                            </h2>
                        </CardHeader>
                        <CardContent className="pt-3">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <DatePicker
                                        label="Request Date"
                                        value={data.request_date}
                                        onChange={(value) => setData("request_date", value)}
                                    />
                                    <div>
                                        <Label className="text-xs">PHP Amount</Label>
                                        <Input
                                            readOnly
                                            value={formatCurrency(data.php_amount)}
                                            className="text-sm bg-slate-50 font-semibold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs">Payee Name</Label>
                                    <Input
                                        value={data.payee_name}
                                        onChange={(e) => setData("payee_name", e.target.value)}
                                        className="text-sm"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs">Purpose</Label>
                                    <Textarea
                                        rows={2}
                                        value={data.purpose}
                                        onChange={(e) => setData("purpose", e.target.value)}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {["po_number", "cer_number", "si_number"].map((field) => (
                                        <div key={field}>
                                            <Label className="text-xs capitalize">
                                                {field.replace("_", " ")}
                                            </Label>
                                            <Input
                                                value={data[field]}
                                                onChange={(e) => setData(field, e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Account Charge</Label>
                                        <Input
                                            value={data.account_charge}
                                            onChange={(e) => setData("account_charge", e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Service Line Distribution</Label>
                                        <Input
                                            value={data.service_line_dist}
                                            onChange={(e) =>
                                                setData("service_line_dist", e.target.value)
                                            }
                                            className="text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs">Amount in Words</Label>
                                    <Input
                                        readOnly
                                        value={data.amount_in_words}
                                        className="text-sm bg-slate-50"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {["requested_by", "reviewed_by", "approved_by"].map((f) => (
                                        <div key={f}>
                                            <Label className="text-xs capitalize">
                                                {f.replace("_", " ")}
                                            </Label>
                                            <Input
                                                value={data[f]}
                                                onChange={(e) => setData(f, e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={selectedInvoices.size === 0 || processing}
                                    className="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? "Submitting..." : "Submit Requisition"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckRequisitionForm;
