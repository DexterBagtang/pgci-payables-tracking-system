import React, { useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CalendarDays,
    DollarSign,
    FileText,
    User,
    Building2,
    Hash,
    Package,
    Receipt,
    ArrowLeft,
    Edit,
    Plus,
    TrendingUp,
    PieChart,
    Building,
    AlertTriangle,
    CheckCircle,
    FileSearch,
    ClipboardList
} from 'lucide-react';
import BackButton from '@/components/custom/BackButton.jsx';

export default function ProjectShow({ project }) {
    const { auth } = usePage().props;
    const { purchase_orders } = project;

    // Memoized financial calculations
    const financialData = useMemo(() => {
        const totalPOAmount = purchase_orders?.reduce((sum, po) => sum + (parseFloat(po.po_amount) || 0), 0) || 0;
        const totalProjectCost = parseFloat(project.total_project_cost) || 0;
        const remainingBudget = totalProjectCost - totalPOAmount;
        const budgetUtilization = totalProjectCost > 0 ? (totalPOAmount / totalProjectCost) * 100 : 0;

        // Invoice calculations
        let totalInvoicedAmount = 0;
        let totalPaidAmount = 0;
        let pendingInvoices = 0;
        let overdueInvoices = 0;

        purchase_orders?.forEach(po => {
            po.invoices?.forEach(invoice => {
                totalInvoicedAmount += parseFloat(invoice.invoice_amount) || 0;
                if (invoice.invoice_status?.toLowerCase() === 'paid') {
                    totalPaidAmount += parseFloat(invoice.invoice_amount) || 0;
                }
                if (invoice.invoice_status?.toLowerCase() === 'pending') {
                    pendingInvoices++;
                }
                if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
                    overdueInvoices++;
                }
            });
        });

        // Vendor summary
        const vendorSummary = purchase_orders?.reduce((acc, po) => {
            const vendorName = po.vendor?.name || 'Unknown Vendor';
            if (!acc[vendorName]) {
                acc[vendorName] = {
                    totalPOAmount: 0,
                    poCount: 0,
                    invoiceCount: 0,
                    totalInvoiced: 0
                };
            }
            acc[vendorName].totalPOAmount += parseFloat(po.po_amount) || 0;
            acc[vendorName].poCount += 1;
            acc[vendorName].invoiceCount += po.invoices?.length || 0;
            acc[vendorName].totalInvoiced += po.invoices?.reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0) || 0;
            return acc;
        }, {});

        return {
            totalPOAmount,
            totalProjectCost,
            remainingBudget,
            budgetUtilization,
            totalInvoicedAmount,
            totalPaidAmount,
            pendingInvoices,
            overdueInvoices,
            vendorSummary
        };
    }, [purchase_orders, project.total_project_cost]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'approved':
            case 'completed':
            case 'delivered':
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
            case 'rejected':
            case 'overdue':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'on hold':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatPercentage = (value) => {
        return `${Math.round(value * 100) / 100}%`;
    };



    return (
        <>
            <Head title={`Project: ${project.project_title}`} />

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{project.project_title}</h1>
                            <p className="text-gray-600">CER: {project.cer_number} | SMPO: {project.smpo_number}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <BackButton />
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create PO
                        </Button>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                                <p className="text-lg font-bold">{formatCurrency(financialData.totalProjectCost)}</p>
                                <Badge variant="outline" className="text-xs">Project Cost</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-600">PO Committed</p>
                                <p className="text-lg font-bold text-blue-600">{formatCurrency(financialData.totalPOAmount)}</p>
                                <div className="flex justify-between text-xs">
                                    <span>Utilization</span>
                                    <span>{formatPercentage(financialData.budgetUtilization)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-600">Invoiced</p>
                                <p className="text-lg font-bold text-orange-600">{formatCurrency(financialData.totalInvoicedAmount)}</p>
                                <div className="flex justify-between text-xs">
                                    <span>of PO</span>
                                    <span>{formatPercentage((financialData.totalInvoicedAmount / financialData.totalPOAmount) * 100)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-600">Paid</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(financialData.totalPaidAmount)}</p>
                                <div className="flex justify-between text-xs">
                                    <span>of Invoiced</span>
                                    <span>{formatPercentage((financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-600">Remaining</p>
                                <p className={`text-lg font-bold ${
                                    financialData.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {formatCurrency(financialData.remainingBudget)}
                                </p>
                                <Badge variant={
                                    financialData.remainingBudget >= 0 ? 'default' : 'destructive'
                                } className="text-xs">
                                    {financialData.remainingBudget >= 0 ? 'Within Budget' : 'Over Budget'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vendor Summary */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Building className="h-4 w-4" />
                                    Vendor Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {financialData.vendorSummary && Object.entries(financialData.vendorSummary)
                                        .sort(([,a], [,b]) => b.totalPOAmount - a.totalPOAmount)
                                        .map(([vendor, data]) => (
                                            <div key={vendor} className="p-2 border rounded-lg">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium text-sm">{vendor}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {data.poCount} PO{data.poCount !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span>PO Amount:</span>
                                                        <span className="font-medium">{formatCurrency(data.totalPOAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Invoiced:</span>
                                                        <span>{formatCurrency(data.totalInvoiced)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Invoices:</span>
                                                        <span>{data.invoiceCount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PO & Invoice Summary */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <ClipboardList className="h-4 w-4" />
                                    Purchase Orders & Invoices
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {purchase_orders?.map(po => (
                                        <div key={po.id} className="border rounded-lg p-3">
                                            {/* PO Header */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-blue-500" />
                                                        <span className="font-medium">{po.po_number}</span>
                                                        <Badge className={getStatusColor(po.po_status)}>
                                                            {po.po_status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        Vendor: {po.vendor?.name} | {formatCurrency(po.po_amount)} | {formatDate(po.po_date)}
                                                    </p>
                                                </div>
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {formatPercentage((po.po_amount / financialData.totalProjectCost) * 100)}
                                                </span>
                                            </div>

                                            {/* Invoices */}
                                            {po.invoices && po.invoices.length > 0 ? (
                                                <div className="ml-6 space-y-2">
                                                    {po.invoices.map(invoice => (
                                                        <div key={invoice.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <Receipt className="h-3 w-3 text-green-500" />
                                                                <span>{invoice.si_number}</span>
                                                                <Badge className={getStatusColor(invoice.invoice_status)}>
                                                                    {invoice.invoice_status}
                                                                </Badge>
                                                                {invoice.due_date && new Date(invoice.due_date) < new Date() && (
                                                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span>{formatCurrency(invoice.invoice_amount)}</span>
                                                                <span className="text-gray-500">{formatDate(invoice.due_date)}</span>
                                                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                                                    <FileSearch className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="ml-6 text-xs text-gray-500 italic py-1">
                                                    No invoices yet
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Package className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-lg font-bold">{purchase_orders?.length || 0}</p>
                            <p className="text-xs text-gray-600">Total POs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <Receipt className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                            <p className="text-lg font-bold">
                                {purchase_orders?.reduce((sum, po) => sum + (po.invoices?.length || 0), 0) || 0}
                            </p>
                            <p className="text-xs text-gray-600">Total Invoices</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <p className="text-lg font-bold">{financialData.pendingInvoices}</p>
                            <p className="text-xs text-gray-600">Pending Invoices</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                            <p className="text-lg font-bold">{financialData.overdueInvoices}</p>
                            <p className="text-xs text-gray-600">Overdue Invoices</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
