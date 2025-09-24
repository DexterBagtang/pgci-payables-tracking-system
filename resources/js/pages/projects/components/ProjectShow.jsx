import React, { useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    ClipboardList,
    Users,
    Tag
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
        if (isNaN(value) || !isFinite(value)) return '0%';
        return `${Math.round(value * 100) / 100}%`;
    };

    const renderProjectDetails = () => {
        let details = [`CER: ${project.cer_number || 'N/A'}`];

        if (project.project_type === 'sm_project') {
            details.push(`SMPO: ${project.smpo_number || 'N/A'}`);
        } else if (project.project_type === 'philcom_project') {
            if (project.philcom_category) {
                details.push(`Category: ${project.philcom_category}`);
            }
            if (project.team) {
                details.push(`Team: ${project.team}`);
            }
        }

        return details.join(' | ');
    };

    return (
        <>
            <Head title={`Project: ${project.project_title}`} />

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{project.project_title}</h1>
                                <Badge className={getStatusColor(project.project_status)}>
                                    {project.project_status || 'Unknown'}
                                </Badge>
                            </div>
                            <p className="text-gray-600">{renderProjectDetails()}</p>
                            {project.project_type && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                        {project.project_type.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {project.project_type === 'philcom_project' && project.philcom_category && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {project.philcom_category}
                                        </Badge>
                                    )}
                                    {project.project_type === 'philcom_project' && project.team && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Users className="h-3 w-3 mr-1" />
                                            {project.team}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <BackButton />
                        <Button size="sm"
                                onClick={()=>router.get(`/purchase-orders/create?project_id=${project.id}`)}>
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
                                <p className="text-lg font-bold">
                                    {financialData.totalProjectCost > 0 ? formatCurrency(financialData.totalProjectCost) : (
                                        <span className="text-gray-400">No budget set</span>
                                    )}
                                </p>
                                <Badge variant="outline" className="text-xs">Project Cost</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">PO Committed</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {financialData.totalPOAmount > 0 ? formatCurrency(financialData.totalPOAmount) : (
                                        <span className="text-gray-400">₱0.00</span>
                                    )}
                                </p>
                                <div className="space-y-1">
                                    <Progress
                                        value={Math.min(financialData.budgetUtilization, 100)}
                                        className={`h-2 ${
                                            financialData.budgetUtilization >= 90 ? '[&>div]:bg-red-500' :
                                                financialData.budgetUtilization >= 75 ? '[&>div]:bg-yellow-500' :
                                                    '[&>div]:bg-blue-500'
                                        }`}
                                    />
                                    <div className="flex justify-between items-center text-xs">
                                        <span>Utilization</span>
                                        <Badge variant={
                                            financialData.budgetUtilization >= 90 ? 'destructive' :
                                                financialData.budgetUtilization >= 75 ? 'secondary' : 'outline'
                                        } className="text-xs font-semibold">
                                            {formatPercentage(financialData.budgetUtilization)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Invoiced</p>
                                <p className="text-lg font-bold text-orange-600">
                                    {financialData.totalInvoicedAmount > 0 ? formatCurrency(financialData.totalInvoicedAmount) : (
                                        <span className="text-gray-400">₱0.00</span>
                                    )}
                                </p>
                                <div className="space-y-1">
                                    <Progress
                                        value={Math.min((financialData.totalInvoicedAmount / financialData.totalPOAmount) * 100, 100)}
                                        className={`h-2 ${
                                            (financialData.totalInvoicedAmount / financialData.totalPOAmount) * 100 >= 80 ? '[&>div]:bg-green-500' :
                                                (financialData.totalInvoicedAmount / financialData.totalPOAmount) * 100 >= 50 ? '[&>div]:bg-yellow-500' :
                                                    '[&>div]:bg-orange-500'
                                        }`}
                                    />
                                    <div className="flex justify-between items-center text-xs">
                                        <span>of PO</span>
                                        <Badge variant={
                                            (financialData.totalInvoicedAmount / financialData.totalPOAmount) * 100 >= 80 ? 'default' :
                                                (financialData.totalInvoicedAmount / financialData.totalPOAmount) * 100 >= 50 ? 'secondary' : 'outline'
                                        } className="text-xs font-semibold">
                                            {formatPercentage((financialData.totalInvoicedAmount / financialData.totalPOAmount) * 100)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Paid</p>
                                <p className="text-lg font-bold text-green-600">
                                    {financialData.totalPaidAmount > 0 ? formatCurrency(financialData.totalPaidAmount) : (
                                        <span className="text-gray-400">₱0.00</span>
                                    )}
                                </p>
                                <div className="space-y-1">
                                    <Progress
                                        value={Math.min((financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100, 100)}
                                        className={`h-2 ${
                                            (financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100 >= 90 ? '[&>div]:bg-green-500' :
                                                (financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100 >= 70 ? '[&>div]:bg-blue-500' :
                                                    (financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100 >= 30 ? '[&>div]:bg-yellow-500' :
                                                        '[&>div]:bg-red-500'
                                        }`}
                                    />
                                    <div className="flex justify-between items-center text-xs">
                                        <span>of Invoiced</span>
                                        <Badge variant={
                                            (financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100 >= 90 ? 'default' :
                                                (financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100 >= 70 ? 'secondary' :
                                                    (financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100 >= 30 ? 'outline' : 'destructive'
                                        } className="text-xs font-semibold">
                                            {formatPercentage((financialData.totalPaidAmount / financialData.totalInvoicedAmount) * 100)}
                                        </Badge>
                                    </div>
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
                                    {financialData.totalProjectCost > 0 ? formatCurrency(financialData.remainingBudget) : (
                                        <span className="text-gray-400">N/A</span>
                                    )}
                                </p>
                                <Badge variant={
                                    financialData.totalProjectCost === 0 ? 'outline' :
                                        financialData.remainingBudget >= 0 ? 'default' : 'destructive'
                                } className="text-xs">
                                    {financialData.totalProjectCost === 0 ? 'No Budget Set' :
                                        financialData.remainingBudget >= 0 ? 'Within Budget' : 'Over Budget'}
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
                                    {financialData.vendorSummary && Object.keys(financialData.vendorSummary).length > 0 ? (
                                        Object.entries(financialData.vendorSummary)
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
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No vendors assigned yet</p>
                                            <p className="text-xs">Create a PO to get started</p>
                                        </div>
                                    )}
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
                                    {purchase_orders && purchase_orders.length > 0 ? (
                                        purchase_orders.map(po => (
                                            <div key={po.id} className="border rounded-lg p-3">
                                                {/* PO Header */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-blue-500" />
                                                            <span className="font-medium">{po.po_number}</span>
                                                            <Badge className={getStatusColor(po.po_status)}>
                                                                {po.po_status || 'Draft'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-600">
                                                            Vendor: {po.vendor?.name || 'No vendor assigned'} |
                                                            {formatCurrency(po.po_amount)} |
                                                            {formatDate(po.po_date)}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">
                                                        {financialData.totalProjectCost > 0 ?
                                                            <span className={
                                                                ((po.po_amount / financialData.totalProjectCost) * 100) >= 25 ? 'text-red-600 font-bold' :
                                                                    ((po.po_amount / financialData.totalProjectCost) * 100) >= 15 ? 'text-orange-600 font-semibold' :
                                                                        'text-gray-700'
                                                            }>
                                                                {formatPercentage((po.po_amount / financialData.totalProjectCost) * 100)}
                                                            </span> :
                                                            'N/A'
                                                        }
                                                    </span>
                                                </div>

                                                {/* Invoices */}
                                                {po.invoices && po.invoices.length > 0 ? (
                                                    <div className="ml-6 space-y-2">
                                                        {po.invoices.map(invoice => (
                                                            <div key={invoice.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <Receipt className="h-3 w-3 text-green-500" />
                                                                    <span>{invoice.si_number || 'No SI number'}</span>
                                                                    <Badge className={getStatusColor(invoice.invoice_status)}>
                                                                        {invoice.invoice_status || 'Pending'}
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
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium mb-2">No Purchase Orders</p>
                                            <p className="text-sm mb-4">Get started by creating your first purchase order</p>
                                            <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First PO
                                            </Button>
                                        </div>
                                    )}
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
