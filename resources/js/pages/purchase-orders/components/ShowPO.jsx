import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    CheckCircle,
    CreditCard,
    Edit,
    FileText,
    Folder,
    Info,
    Receipt,
    Truck,
    User,
    Eye,
    DollarSign,
    Loader,
    TrendingUp,
    Clock,
    AlertTriangle,
    Calendar,
    PieChart,
    Target,
    Wallet,
    Lock

} from 'lucide-react';
import React, { lazy, Suspense, useState, useMemo } from 'react';
import BackButton from '@/components/custom/BackButton.jsx';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
const ActivityTimeline = lazy(()=> import('@/components/custom/ActivityTimeline.jsx'));
const AttachmentViewer = lazy(()=> import('@/pages/invoices/components/AttachmentViewer.jsx'));
const Remarks = lazy(()=> import('@/components/custom/Remarks.jsx'));
const ClosePurchaseOrderDialog = lazy(()=> import('@/pages/purchase-orders/components/ClosePurchaseOrderDialog.jsx'));

export default function ShowPO({ purchaseOrder, vendors, projects , backUrl}) {
    const [isEditing, setIsEditing] = useState(false);
    // const [tab, setTab] = useState('overview');
    const [tab, setTab] = useRemember('overview','po-detail-tab');
    const [showCreateReqDialog, setShowCreateReqDialog] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const { user } = usePage().props.auth;

    const {files,activity_logs,invoices,remarks} = purchaseOrder;

    // Enhanced financial calculations
    const financialMetrics = useMemo(() => {
        const poAmount = parseFloat(purchaseOrder.po_amount) || 0;
        const vatExAmount = poAmount / 1.12;
        const vatAmount = (poAmount * 0.12) / 1.12;

        // Invoice calculations
        const totalInvoicedAmount = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0) || 0;
        const totalNetAmount = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.net_amount) || 0), 0) || 0;
        const paidAmount = invoices?.reduce((sum, inv) =>
            inv.invoice_status === 'paid' ? sum + (parseFloat(inv.net_amount) || 0) : sum, 0) || 0;

        // Percentages
        const invoicedPercentage = poAmount > 0 ? (totalInvoicedAmount / poAmount) * 100 : 0;
        const paidPercentage = totalInvoicedAmount > 0 ? (paidAmount / totalInvoicedAmount) * 100 : 0;
        const completionPercentage = poAmount > 0 ? (paidAmount / poAmount) * 100 : 0;

        // Outstanding amounts
        const outstandingAmount = poAmount - paidAmount;
        const pendingInvoiceAmount = totalInvoicedAmount - paidAmount;

        // Invoice status counts
        const paidInvoices = invoices?.filter(inv => inv.invoice_status === 'paid').length || 0;
        const pendingInvoices = invoices?.filter(inv => inv.invoice_status === 'pending').length || 0;
        const overdueInvoices = invoices?.filter(inv => {
            if (!inv.due_date || inv.invoice_status === 'paid') return false;
            return new Date(inv.due_date) < new Date();
        }).length || 0;

        // Days calculations
        const daysSincePO = purchaseOrder.po_date ?
            Math.floor((new Date() - new Date(purchaseOrder.po_date)) / (1000 * 60 * 60 * 24)) : 0;
        const daysToDelivery = purchaseOrder.expected_delivery_date ?
            Math.floor((new Date(purchaseOrder.expected_delivery_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

        return {
            poAmount,
            vatExAmount,
            vatAmount,
            totalInvoicedAmount,
            totalNetAmount,
            paidAmount,
            outstandingAmount,
            pendingInvoiceAmount,
            invoicedPercentage,
            paidPercentage,
            completionPercentage,
            paidInvoices,
            pendingInvoices,
            overdueInvoices,
            daysSincePO,
            daysToDelivery
        };
    }, [purchaseOrder, invoices]);

    // Helper function to format currency
    const formatCurrency = (amount, currency = 'PHP') => {
        if (!amount) {
            return currency === 'USD' ? '$0.00' : '₱0.00';
        }
        const locale = currency === 'USD' ? 'en-US' : 'en-PH';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Helper function to format date
    const formatDate = (date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM dd, yyyy');
    };

    // Helper function to format percentage
    const formatPercentage = (value) => {
        if (isNaN(value) || !isFinite(value)) return '0%';
        return `${Math.round(value * 100) / 100}%`;
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const statusColors = {
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            open: 'bg-blue-100 text-blue-800 border-blue-200',
            closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto max-w-7xl space-y-6 p-6">
                    {/* Enhanced Header with Key Info */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            {/* PO Title & Status */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">Purchase Order #{purchaseOrder.po_number}</h1>
                                    <StatusBadge status={purchaseOrder.po_status} />
                                    {financialMetrics.overdueInvoices > 0 && (
                                        <Badge variant="destructive" className="px-2 py-1">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {financialMetrics.overdueInvoices} Overdue
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-sm text-slate-600 flex flex-wrap gap-4">
                                    <span>Created {formatDate(purchaseOrder.created_at)}</span>
                                    <span>PO Date {formatDate(purchaseOrder.po_date)}</span>
                                    <span>{financialMetrics.daysSincePO} days old</span>
                                    {financialMetrics.daysToDelivery !== null && (
                                        <span className={financialMetrics.daysToDelivery < 0 ? 'text-red-600 font-medium' : 'text-blue-600'}>
                                            {financialMetrics.daysToDelivery < 0 ?
                                                `${Math.abs(financialMetrics.daysToDelivery)} days overdue` :
                                                `${financialMetrics.daysToDelivery} days to delivery`
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-shrink-0 gap-2">
                                <BackButton />
                                <Link href={`/purchase-orders/${purchaseOrder.id}/edit`} prefetch>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                {(user.role === 'purchasing' || user.role === 'admin') && purchaseOrder.po_status !== 'closed' && purchaseOrder.po_status !== 'cancelled' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowCloseDialog(true)}
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Close PO
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Metrics Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* PO Amount */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600">PO Amount</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {formatCurrency(financialMetrics.poAmount, purchaseOrder.currency)}
                                    </p>
                                    <div className="space-y-1 text-xs text-gray-500">
                                        <div>VAT Ex: {formatCurrency(financialMetrics.vatExAmount, purchaseOrder.currency)}</div>
                                        <div>VAT (12%): {formatCurrency(financialMetrics.vatAmount, purchaseOrder.currency)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Invoiced */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600">Invoiced</p>
                                    <p className="text-lg font-bold text-orange-600">
                                        {financialMetrics.totalInvoicedAmount > 0 ?
                                            formatCurrency(financialMetrics.totalInvoicedAmount, purchaseOrder.currency) :
                                            <span className="text-gray-400">{purchaseOrder.currency === 'USD' ? '$0.00' : '₱0.00'}</span>
                                        }
                                    </p>
                                    <div className="space-y-1">
                                        <Progress
                                            value={Math.min(financialMetrics.invoicedPercentage, 100)}
                                            className={`h-2 ${
                                                financialMetrics.invoicedPercentage >= 80 ? '[&>div]:bg-green-500' :
                                                    financialMetrics.invoicedPercentage >= 50 ? '[&>div]:bg-yellow-500' :
                                                        '[&>div]:bg-orange-500'
                                            }`}
                                        />
                                        <div className="flex justify-between items-center text-xs">
                                            <span>of PO</span>
                                            <Badge variant={
                                                financialMetrics.invoicedPercentage >= 80 ? 'default' :
                                                    financialMetrics.invoicedPercentage >= 50 ? 'secondary' : 'outline'
                                            } className="text-xs font-semibold">
                                                {formatPercentage(financialMetrics.invoicedPercentage)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Paid */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600">Paid</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {financialMetrics.paidAmount > 0 ?
                                            formatCurrency(financialMetrics.paidAmount, purchaseOrder.currency) :
                                            <span className="text-gray-400">{purchaseOrder.currency === 'USD' ? '$0.00' : '₱0.00'}</span>
                                        }
                                    </p>
                                    <div className="space-y-1">
                                        <Progress
                                            value={Math.min(financialMetrics.paidPercentage, 100)}
                                            className={`h-2 ${
                                                financialMetrics.paidPercentage >= 90 ? '[&>div]:bg-green-500' :
                                                    financialMetrics.paidPercentage >= 70 ? '[&>div]:bg-blue-500' :
                                                        financialMetrics.paidPercentage >= 30 ? '[&>div]:bg-yellow-500' :
                                                            '[&>div]:bg-red-500'
                                            }`}
                                        />
                                        <div className="flex justify-between items-center text-xs">
                                            <span>of Invoiced</span>
                                            <Badge variant={
                                                financialMetrics.paidPercentage >= 90 ? 'default' :
                                                    financialMetrics.paidPercentage >= 70 ? 'secondary' :
                                                        financialMetrics.paidPercentage >= 30 ? 'outline' : 'destructive'
                                            } className="text-xs font-semibold">
                                                {formatPercentage(financialMetrics.paidPercentage)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Outstanding */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                                    <p className={`text-lg font-bold ${
                                        financialMetrics.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                        {formatCurrency(financialMetrics.outstandingAmount, purchaseOrder.currency)}
                                    </p>
                                    <div className="text-xs space-y-1">
                                        <div className="flex justify-between">
                                            <span>Pending Payment:</span>
                                            <span className="font-medium">{formatCurrency(financialMetrics.pendingInvoiceAmount, purchaseOrder.currency)}</span>
                                        </div>
                                        <Badge variant={
                                            financialMetrics.outstandingAmount === 0 ? 'default' : 'destructive'
                                        } className="text-xs w-full justify-center">
                                            {financialMetrics.outstandingAmount === 0 ? 'Fully Paid' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Completion */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600">Completion</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatPercentage(financialMetrics.completionPercentage)}
                                    </p>
                                    <div className="space-y-1">
                                        <Progress
                                            value={Math.min(financialMetrics.completionPercentage, 100)}
                                            className={`h-2 ${
                                                financialMetrics.completionPercentage >= 100 ? '[&>div]:bg-green-500' :
                                                    financialMetrics.completionPercentage >= 75 ? '[&>div]:bg-blue-500' :
                                                        financialMetrics.completionPercentage >= 50 ? '[&>div]:bg-yellow-500' :
                                                            '[&>div]:bg-red-500'
                                            }`}
                                        />
                                        <div className="text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span>Invoices:</span>
                                                <span className="font-medium">{invoices?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Invoice Status Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Receipt className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                                <p className="text-lg font-bold">{invoices?.length || 0}</p>
                                <p className="text-xs text-gray-600">Total Invoices</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                                <p className="text-lg font-bold text-green-600">{financialMetrics.paidInvoices}</p>
                                <p className="text-xs text-gray-600">Paid Invoices</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                                <p className="text-lg font-bold text-yellow-600">{financialMetrics.pendingInvoices}</p>
                                <p className="text-xs text-gray-600">Pending Invoices</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                                <p className="text-lg font-bold text-red-600">{financialMetrics.overdueInvoices}</p>
                                <p className="text-xs text-gray-600">Overdue Invoices</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Original Key Information Grid - now more compact */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Info className="mr-2 h-5 w-5 text-indigo-600" />
                            Key Information
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Vendor */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <User className="mr-2 h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-slate-700">Vendor</span>
                                </div>
                                <div className="truncate font-semibold text-slate-900">{purchaseOrder.vendor?.name || 'No Vendor'}</div>
                                <div className="truncate text-sm text-slate-600">{purchaseOrder.vendor?.category || ''}</div>
                            </div>
                            {/* Project */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <Folder className="mr-2 h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">Project</span>
                                </div>
                                <div className="text-wrap font-semibold text-slate-900">{purchaseOrder.project?.project_title || 'No Project'}</div>
                                <div className="font-mono text-sm text-slate-600">
                                    {purchaseOrder.project?.cer_number ? `CER: ${purchaseOrder.project.cer_number}` : 'N/A'}
                                </div>
                            </div>
                            {/* Timeline */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-700">Timeline</span>
                                </div>
                                <div className="text-sm space-y-1">
                                    <div>PO Date: <span className="font-medium">{formatDate(purchaseOrder.po_date)}</span></div>
                                    {purchaseOrder.expected_delivery_date && (
                                        <div>Expected: <span className="font-medium">{formatDate(purchaseOrder.expected_delivery_date)}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabbed Content */}
                    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                        {/* Modern Status Pills Navigation */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    {
                                        value: 'overview',
                                        label: 'Overview',
                                        icon: Info,
                                        activeClasses: 'border-blue-500 bg-blue-50 shadow-sm',
                                        iconActiveClasses: 'text-blue-600',
                                        textActiveClasses: 'text-blue-700',
                                        indicatorClasses: 'bg-blue-500'
                                    },
                                    {
                                        value: 'financial',
                                        label: 'Financial',
                                        icon: DollarSign,
                                        activeClasses: 'border-green-500 bg-green-50 shadow-sm',
                                        iconActiveClasses: 'text-green-600',
                                        textActiveClasses: 'text-green-700',
                                        indicatorClasses: 'bg-green-500'
                                    },
                                    {
                                        value: 'invoices',
                                        label: `Invoices (${purchaseOrder.invoices?.length || 0})`,
                                        icon: Receipt,
                                        activeClasses: 'border-orange-500 bg-orange-50 shadow-sm',
                                        iconActiveClasses: 'text-orange-600',
                                        textActiveClasses: 'text-orange-700',
                                        indicatorClasses: 'bg-orange-500'
                                    },
                                    {
                                        value: 'attachments',
                                        label: `Attachments (${purchaseOrder.files?.length || 0})`,
                                        icon: FileText,
                                        activeClasses: 'border-purple-500 bg-purple-50 shadow-sm',
                                        iconActiveClasses: 'text-purple-600',
                                        textActiveClasses: 'text-purple-700',
                                        indicatorClasses: 'bg-purple-500'
                                    },
                                    {
                                        value: 'remarks',
                                        label: `Remarks (${remarks?.length || 0})`,
                                        icon: FileText,
                                        activeClasses: 'border-indigo-500 bg-indigo-50 shadow-sm',
                                        iconActiveClasses: 'text-indigo-600',
                                        textActiveClasses: 'text-indigo-700',
                                        indicatorClasses: 'bg-indigo-500'
                                    },
                                    {
                                        value: 'timeline',
                                        label: 'Activity Logs',
                                        icon: Clock,
                                        activeClasses: 'border-slate-500 bg-slate-50 shadow-sm',
                                        iconActiveClasses: 'text-slate-600',
                                        textActiveClasses: 'text-slate-700',
                                        indicatorClasses: 'bg-slate-500'
                                    },
                                ].map((tabConfig) => {
                                    const Icon = tabConfig.icon;
                                    const isActive = tab === tabConfig.value;

                                    return (
                                        <button
                                            key={tabConfig.value}
                                            onClick={() => setTab(tabConfig.value)}
                                            className={`
                                                group relative flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all duration-200
                                                ${isActive
                                                    ? tabConfig.activeClasses
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <Icon className={`h-4 w-4 transition-colors ${
                                                isActive ? tabConfig.iconActiveClasses : 'text-gray-500 group-hover:text-gray-700'
                                            }`} />
                                            <span className={`text-sm font-medium transition-colors ${
                                                isActive ? tabConfig.textActiveClasses : 'text-gray-700 group-hover:text-gray-900'
                                            }`}>
                                                {tabConfig.label}
                                            </span>
                                            {isActive && (
                                                <div className={`absolute -bottom-2 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full ${tabConfig.indicatorClasses}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Main PO Details */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <FileText className="mr-2 h-5 w-5 text-blue-600" />
                                            Purchase Order Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {purchaseOrder.description && (
                                            <div className="border-b pb-4">
                                                <div className="mb-2 text-sm font-medium text-slate-700">Description</div>
                                                <div className="rounded bg-slate-50 p-3 text-sm text-slate-700">{purchaseOrder.description}</div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-500">PO Number</div>
                                                <div className="font-medium">{purchaseOrder.po_number || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">PO Date</div>
                                                <div className="font-medium">{formatDate(purchaseOrder.po_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Status</div>
                                                <StatusBadge status={purchaseOrder.po_status} />
                                            </div>
                                            {purchaseOrder.expected_delivery_date && (
                                                <div>
                                                    <div className="text-slate-500">Expected Delivery</div>
                                                    <div className="font-medium">{formatDate(purchaseOrder.expected_delivery_date)}</div>
                                                </div>
                                            )}
                                            {purchaseOrder.payment_term && (
                                                <div>
                                                    <div className="text-slate-500">Payment Terms</div>
                                                    <div className="font-medium">{purchaseOrder.payment_term}</div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Related Information */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <Info className="mr-2 h-5 w-5 text-indigo-600" />
                                            Related Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Vendor Details */}
                                        {purchaseOrder.vendor && (
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">Vendor Information</h4>
                                                    <Link href={`/vendors/${purchaseOrder.vendor.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Name:</span>
                                                        <span className="font-medium">{purchaseOrder.vendor.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Category:</span>
                                                        <span className="font-medium">{purchaseOrder.vendor.category}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Contact:</span>
                                                        <span className="text-right font-medium">
                                                            {purchaseOrder.vendor.email && <div>{purchaseOrder.vendor.email}</div>}
                                                            {purchaseOrder.vendor.phone && <div>{purchaseOrder.vendor.phone}</div>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Details */}
                                        {purchaseOrder.project && (
                                            <div className="border-t pt-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">Project Information</h4>
                                                    <Link href={`/projects/${purchaseOrder.project.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Title:</span>
                                                        <span className="max-w-[200px] truncate text-right font-medium">{purchaseOrder.project.project_title}</span>
                                                    </div>
                                                    {purchaseOrder.project.cer_number && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">CER Number:</span>
                                                            <span className="font-mono font-medium">{purchaseOrder.project.cer_number}</span>
                                                        </div>
                                                    )}
                                                    {purchaseOrder.project.smpo_number && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">SMPO Number:</span>
                                                            <span className="font-mono font-medium">{purchaseOrder.project.smpo_number}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Type:</span>
                                                        <span className="font-medium capitalize">
                                                            {purchaseOrder.project.project_type?.replace('_', ' ') || 'Not specified'}
                                                        </span>
                                                    </div>
                                                    {purchaseOrder.project.project_type === 'philcom_project' && purchaseOrder.project.philcom_category && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">Philcom Category:</span>
                                                            <span className="font-medium capitalize">
                                                                {purchaseOrder.project.philcom_category.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Total Project Cost:</span>
                                                        <span className="font-medium capitalize">
                                                            {purchaseOrder.project.total_project_cost ? formatCurrency(purchaseOrder.project.total_project_cost, purchaseOrder.currency) : 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Details */}
                                        {(purchaseOrder.expected_delivery_date || purchaseOrder.payment_term) && (
                                            <div className="border-t pt-4">
                                                <h4 className="mb-3 font-medium text-slate-800">Additional Details</h4>
                                                <div className="space-y-2 text-sm">
                                                    {purchaseOrder.expected_delivery_date && (
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="h-4 w-4 text-orange-600" />
                                                            <span>Expected Delivery: {formatDate(purchaseOrder.expected_delivery_date)}</span>
                                                        </div>
                                                    )}
                                                    {purchaseOrder.payment_term && (
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="h-4 w-4 text-purple-600" />
                                                            <span>Payment Terms: {purchaseOrder.payment_term}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Financial Tab */}
                        <TabsContent value="financial" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Enhanced Financial Breakdown */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                                            Detailed Financial Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-slate-500">Subtotal (VAT Excluded)</span>
                                                <span className="font-medium">{formatCurrency(financialMetrics.vatExAmount, purchaseOrder.currency)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-slate-500">VAT (12%)</span>
                                                <span className="font-medium">{formatCurrency(financialMetrics.vatAmount, purchaseOrder.currency)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-slate-500">Total PO Amount</span>
                                                <span className="font-bold text-green-600">{formatCurrency(financialMetrics.poAmount, purchaseOrder.currency)}</span>
                                            </div>
                                        </div>

                                        {/* Invoice Summary */}
                                        <div className="pt-4 border-t">
                                            <h4 className="mb-3 font-medium text-slate-800">Invoice Summary</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500">Total Invoiced:</span>
                                                    <div className="text-right">
                                                        <span className="font-medium text-orange-600">{formatCurrency(financialMetrics.totalInvoicedAmount, purchaseOrder.currency)}</span>
                                                        <div className="text-xs text-slate-400">{formatPercentage(financialMetrics.invoicedPercentage)} of PO</div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500">Amount Paid:</span>
                                                    <div className="text-right">
                                                        <span className="font-medium text-green-600">{formatCurrency(financialMetrics.paidAmount, purchaseOrder.currency)}</span>
                                                        <div className="text-xs text-slate-400">{formatPercentage(financialMetrics.paidPercentage)} of invoiced</div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500">Pending Payment:</span>
                                                    <div className="text-right">
                                                        <span className="font-medium text-yellow-600">{formatCurrency(financialMetrics.pendingInvoiceAmount, purchaseOrder.currency)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center border-t pt-3">
                                                    <span className="text-slate-500 font-medium">Outstanding Balance:</span>
                                                    <div className="text-right">
                                                        <span className={`font-bold ${financialMetrics.outstandingAmount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {formatCurrency(financialMetrics.outstandingAmount, purchaseOrder.currency)}
                                                        </span>
                                                        <div className="text-xs text-slate-400">{formatPercentage((financialMetrics.outstandingAmount / financialMetrics.poAmount) * 100)} remaining</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Enhanced Completion & Performance */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <Target className="mr-2 h-5 w-5 text-blue-600" />
                                            Performance Metrics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Completion Status */}
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-green-600 mb-2">{formatPercentage(financialMetrics.completionPercentage)}</div>
                                            <div className="text-sm text-slate-600">PO Completion</div>
                                            <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                                                <div
                                                    className="h-2 rounded-full bg-green-600 transition-all duration-300"
                                                    style={{ width: `${Math.min(financialMetrics.completionPercentage, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Invoice Metrics */}
                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Total Invoices</span>
                                                <Badge variant="outline" className="font-semibold">{invoices?.length || 0}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Paid Invoices</span>
                                                <Badge variant="default" className="bg-green-100 text-green-800 font-semibold">
                                                    {financialMetrics.paidInvoices}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Pending Invoices</span>
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-semibold">
                                                    {financialMetrics.pendingInvoices}
                                                </Badge>
                                            </div>
                                            {financialMetrics.overdueInvoices > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Overdue Invoices</span>
                                                    <Badge variant="destructive" className="font-semibold">
                                                        {financialMetrics.overdueInvoices}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timeline Info */}
                                        <div className="space-y-3 pt-4 border-t">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">Days Since PO:</span>
                                                <span className="font-medium">{financialMetrics.daysSincePO} days</span>
                                            </div>
                                            {financialMetrics.daysToDelivery !== null && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600">
                                                        {financialMetrics.daysToDelivery >= 0 ? 'Days to Delivery:' : 'Days Overdue:'}
                                                    </span>
                                                    <span className={`font-medium ${
                                                        financialMetrics.daysToDelivery < 0 ? 'text-red-600' : 'text-blue-600'
                                                    }`}>
                                                        {Math.abs(financialMetrics.daysToDelivery)} days
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4">
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => setTab('invoices')}>
                                                <Receipt className="mr-2 h-4 w-4" />
                                                View All Invoices
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices" className="space-y-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-base">
                                        <Receipt className="mr-2 h-4 w-4 text-blue-600" />
                                        Invoices ({invoices?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {invoices && invoices.length > 0 ? (
                                        <div className="space-y-3">
                                            {purchaseOrder.invoices.map((invoice) => (
                                                <div key={invoice.id} className="rounded-md border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-medium text-slate-900">SI #{invoice.si_number}</div>
                                                            <div className="text-xs text-slate-500">{formatDate(invoice.si_date)}</div>
                                                            {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.invoice_status !== 'paid' && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                                    Overdue
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <StatusBadge status={invoice.invoice_status} />
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                                        <div className="flex gap-4">
                                                            <span>Amount: <strong className="text-slate-900">{formatCurrency(invoice.invoice_amount, purchaseOrder.currency)}</strong></span>
                                                            <span>Net: <strong className="text-slate-900">{formatCurrency(invoice.net_amount, purchaseOrder.currency)}</strong></span>
                                                            {invoice.due_date && (
                                                                <span>Due: <strong className="text-slate-900">{formatDate(invoice.due_date)}</strong></span>
                                                            )}
                                                            {invoice.submitted_to && (
                                                                <span>To: <strong className="text-slate-900">{invoice.submitted_to}</strong></span>
                                                            )}
                                                        </div>
                                                        <Link
                                                            href={`/invoices/${invoice.id}`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            View →
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-slate-500">
                                            <Receipt className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                            <div className="text-lg font-medium mb-2">No invoices linked</div>
                                            <p className="text-sm text-slate-400 mb-4">Invoices will appear once created and associated with this PO</p>
                                            <Button variant="outline" size="sm" onClick={() => router.get('/invoices/create')}>
                                                <Receipt className="mr-2 h-4 w-4" />
                                                Create Invoice
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Attachments Tab */}
                        <TabsContent value="attachments" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5 text-purple-600" />
                                        Attached Files ({files?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Suspense fallback={<div className="flex items-center justify-center py-8"><Loader className="h-6 w-6 animate-spin text-blue-600" /></div>}>
                                        <AttachmentViewer files={files || []} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="remarks" className="space-y-6">
                            <Suspense fallback={<Loader className="animate-spin" />}>
                                <Remarks remarks={remarks} remarkableType={"PurchaseOrder"} remarkableId={purchaseOrder.id} />
                            </Suspense>
                        </TabsContent>

                        {/* Audit Trail Tab */}
                        <TabsContent value="timeline" className="space-y-6">
                            <Suspense fallback={<Loader className="animate-spin" />}>
                                <ActivityTimeline activity_logs={activity_logs} title={"Purchase Order Timeline"} entityType={"Purchase Order"} />
                            </Suspense>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Close PO Dialog */}
            <Suspense fallback={null}>
                <ClosePurchaseOrderDialog
                    open={showCloseDialog}
                    onOpenChange={setShowCloseDialog}
                    purchaseOrder={purchaseOrder}
                />
            </Suspense>
        </>
    );
}
