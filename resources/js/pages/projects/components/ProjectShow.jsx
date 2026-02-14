import { useMemo, useState, lazy, Suspense } from 'react';
import { Head, Link, router, usePage, useRemember } from '@inertiajs/react';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    CalendarDays,
    DollarSign,
    FileText,
    Hash,
    Package,
    Receipt,
    Plus,
    TrendingUp,
    Building,
    AlertTriangle,
    CheckCircle,
    Users,
    Tag,
    Clock,
    XCircle,
    Loader,
    Activity,
    ShoppingCart
} from 'lucide-react';
import BackButton from '@/components/custom/BackButton.jsx';
import { route } from 'ziggy-js';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import InvoicesList from '@/components/custom/InvoicesList.jsx';
import { usePermissions } from '@/hooks/use-permissions';

const Remarks = lazy(() => import("@/components/custom/Remarks.jsx"));
const ActivityTimeline = lazy(() => import("@/components/custom/ActivityTimeline.jsx"));

export default function ProjectShow({ project }) {
    const { auth } = usePage().props;
    const { canWrite } = usePermissions();
    const { purchase_orders, remarks = [], activity_logs = [] } = project;
    const [activeTab, setActiveTab] = useRemember('overview','project-details-tab');

    // Memoized financial calculations
    const financialData = useMemo(() => {
        // Calculate PO amounts by currency
        const totalPOAmountPHP = purchase_orders?.reduce((sum, po) =>
            sum + (po.currency === 'PHP' ? (parseFloat(po.po_amount) || 0) : 0), 0) || 0;
        const totalPOAmountUSD = purchase_orders?.reduce((sum, po) =>
            sum + (po.currency === 'USD' ? (parseFloat(po.po_amount) || 0) : 0), 0) || 0;

        const totalProjectCost = parseFloat(project.total_project_cost) || 0;
        const totalContractCost = parseFloat(project.total_contract_cost) || 0;

        // Budget calculations - PHP only (project budgets are PHP-only)
        const remainingBudgetPHP = totalProjectCost - totalPOAmountPHP;
        const budgetUtilizationPHP = totalProjectCost > 0 ? (totalPOAmountPHP / totalProjectCost) * 100 : 0;

        // USD POs have no budget comparison (project budget is PHP-only)
        const hasUSDPOs = totalPOAmountUSD > 0;

        // Invoice calculations by currency
        let totalInvoicedAmountPHP = 0;
        let totalInvoicedAmountUSD = 0;
        let totalPaidAmountPHP = 0;
        let totalPaidAmountUSD = 0;
        let totalOutstandingPHP = 0;
        let totalOutstandingUSD = 0;
        let paidInvoices = 0;
        let pendingInvoices = 0;
        let overdueInvoices = 0;
        let draftInvoices = 0;

        const today = new Date();

        purchase_orders?.forEach(po => {
            po.invoices?.forEach(invoice => {
                const invoiceAmount = parseFloat(invoice.net_amount || invoice.invoice_amount) || 0;
                const currency = invoice.currency || 'PHP';

                if (currency === 'USD') {
                    totalInvoicedAmountUSD += invoiceAmount;
                } else {
                    totalInvoicedAmountPHP += invoiceAmount;
                }

                const status = invoice.invoice_status?.toLowerCase();

                if (status === 'paid') {
                    if (currency === 'USD') {
                        totalPaidAmountUSD += invoiceAmount;
                    } else {
                        totalPaidAmountPHP += invoiceAmount;
                    }
                    paidInvoices++;
                } else {
                    if (currency === 'USD') {
                        totalOutstandingUSD += invoiceAmount;
                    } else {
                        totalOutstandingPHP += invoiceAmount;
                    }

                    if (status === 'pending' || status === 'submitted') {
                        pendingInvoices++;
                    } else if (status === 'draft') {
                        draftInvoices++;
                    }

                    // Check if overdue
                    if (invoice.due_date && new Date(invoice.due_date) < today) {
                        overdueInvoices++;
                    }
                }
            });
        });

        // Invoice progress - separate by currency
        const invoicedProgressPHP = totalPOAmountPHP > 0 ? (totalInvoicedAmountPHP / totalPOAmountPHP) * 100 : 0;
        const invoicedProgressUSD = totalPOAmountUSD > 0 ? (totalInvoicedAmountUSD / totalPOAmountUSD) * 100 : 0;

        // Payment progress - separate by currency
        const paymentProgressPHP = totalInvoicedAmountPHP > 0 ? (totalPaidAmountPHP / totalInvoicedAmountPHP) * 100 : 0;
        const paymentProgressUSD = totalInvoicedAmountUSD > 0 ? (totalPaidAmountUSD / totalInvoicedAmountUSD) * 100 : 0;

        // PO Status breakdown
        const poStatusCounts = purchase_orders?.reduce((acc, po) => {
            const status = po.po_status?.toLowerCase() || 'draft';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Vendor summary by currency
        const vendorSummary = purchase_orders?.reduce((acc, po) => {
            const vendorId = po.vendor?.id;
            const vendorName = po.vendor?.name || 'Unknown Vendor';

            if (!acc[vendorId]) {
                acc[vendorId] = {
                    id: vendorId,
                    name: vendorName,
                    totalPOAmount: 0,
                    totalPOAmountPHP: 0,
                    totalPOAmountUSD: 0,
                    poCount: 0,
                    invoiceCount: 0,
                    totalInvoiced: 0,
                    totalInvoicedPHP: 0,
                    totalInvoicedUSD: 0,
                    totalPaid: 0,
                    totalPaidPHP: 0,
                    totalPaidUSD: 0,
                    outstanding: 0,
                    outstandingPHP: 0,
                    outstandingUSD: 0
                };
            }

            const poAmount = parseFloat(po.po_amount) || 0;
            const poCurrency = po.currency || 'PHP';
            acc[vendorId].totalPOAmount += poAmount;
            if (poCurrency === 'USD') {
                acc[vendorId].totalPOAmountUSD += poAmount;
            } else {
                acc[vendorId].totalPOAmountPHP += poAmount;
            }
            acc[vendorId].poCount += 1;

            po.invoices?.forEach(inv => {
                acc[vendorId].invoiceCount += 1;
                const invAmount = parseFloat(inv.net_amount || inv.invoice_amount) || 0;
                const invCurrency = inv.currency || 'PHP';

                acc[vendorId].totalInvoiced += invAmount;
                if (invCurrency === 'USD') {
                    acc[vendorId].totalInvoicedUSD += invAmount;
                } else {
                    acc[vendorId].totalInvoicedPHP += invAmount;
                }

                if (inv.invoice_status?.toLowerCase() === 'paid') {
                    acc[vendorId].totalPaid += invAmount;
                    if (invCurrency === 'USD') {
                        acc[vendorId].totalPaidUSD += invAmount;
                    } else {
                        acc[vendorId].totalPaidPHP += invAmount;
                    }
                } else {
                    acc[vendorId].outstanding += invAmount;
                    if (invCurrency === 'USD') {
                        acc[vendorId].outstandingUSD += invAmount;
                    } else {
                        acc[vendorId].outstandingPHP += invAmount;
                    }
                }
            });

            return acc;
        }, {});

        return {
            // Currency-separated totals
            totalPOAmountPHP,
            totalPOAmountUSD,
            totalInvoicedAmountPHP,
            totalInvoicedAmountUSD,
            totalPaidAmountPHP,
            totalPaidAmountUSD,
            totalOutstandingPHP,
            totalOutstandingUSD,
            // Budget metrics - PHP only
            totalProjectCost,
            totalContractCost,
            remainingBudgetPHP,
            budgetUtilizationPHP,
            hasUSDPOs,
            // Progress metrics - currency-separated
            invoicedProgressPHP,
            invoicedProgressUSD,
            paymentProgressPHP,
            paymentProgressUSD,
            // Invoice counts
            paidInvoices,
            pendingInvoices,
            overdueInvoices,
            draftInvoices,
            poStatusCounts,
            vendorSummary: Object.values(vendorSummary || {})
        };
    }, [purchase_orders, project.total_project_cost, project.total_contract_cost]);


    const formatCurrency = (amount, currency = 'PHP') => {
        const currencyCode = currency || 'PHP';
        const locale = currencyCode === 'USD' ? 'en-US' : 'en-PH';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2
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

    const getProjectHealthStatus = () => {
        if (financialData.overdueInvoices > 0) {
            return { status: 'critical', label: 'Overdue Invoices', color: 'red' };
        }
        if (financialData.budgetUtilizationPHP > 100) {
            return { status: 'warning', label: 'Over Budget', color: 'red' };
        }
        if (financialData.budgetUtilizationPHP > 90) {
            return { status: 'warning', label: 'Near Budget Limit', color: 'orange' };
        }
        if (financialData.pendingInvoices > 3) {
            return { status: 'attention', label: 'Many Pending', color: 'yellow' };
        }
        return { status: 'good', label: 'On Track', color: 'green' };
    };

    const healthStatus = getProjectHealthStatus();

    const renderProjectDetails = () => {
        let details = [];

        if (project.cer_number) {
            details.push(`CER: ${project.cer_number}`);
        }

        if (project.project_type === 'sm_project' && project.smpo_number) {
            details.push(`SMPO: ${project.smpo_number}`);
        }

        return details.join(' | ');
    };

    return (
        <>
            <Head title={`Project: ${project.project_title}`} />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-gray-900 max-w-2xl" >
                                            {project.project_title}
                                        </h1>
                                        {/*<Badge variant={project.project_status === 'active' ? "default" : "secondary"}>*/}
                                        {/*    {project.project_status || 'Draft'}*/}
                                        {/*</Badge>*/}
                                        <Badge
                                            variant="outline"
                                            className={`border-${healthStatus.color}-200 text-${healthStatus.color}-700 bg-${healthStatus.color}-50`}
                                        >
                                            {healthStatus.label}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 mt-1">{renderProjectDetails()}</p>
                                    {project.project_type && (
                                        <div className="flex items-center gap-2 mt-2">
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
                                {canWrite('purchase_orders') && (
                                    <Button
                                        size="sm"
                                        onClick={() => router.get(`/purchase-orders/create?project_id=${project.id}`)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Purchase Order
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Overview Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                        {/* Total Budget */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">Project Budget</p>
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {financialData.totalProjectCost > 0
                                            ? formatCurrency(financialData.totalProjectCost)
                                            : <span className="text-gray-400 text-lg">Not Set</span>
                                        }
                                    </p>
                                    {financialData.totalContractCost > 0 && (
                                        <div className="text-xs text-gray-500">
                                            Contract: {formatCurrency(financialData.totalContractCost)}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* PO Committed */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">PO Committed</p>
                                        <ShoppingCart className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        {financialData.totalPOAmountPHP > 0 && (
                                            <p className="text-2xl font-bold text-purple-600">
                                                {formatCurrency(financialData.totalPOAmountPHP, 'PHP')}
                                            </p>
                                        )}
                                        {financialData.totalPOAmountUSD > 0 && (
                                            <p className="text-2xl font-bold text-purple-600">
                                                {formatCurrency(financialData.totalPOAmountUSD, 'USD')}
                                            </p>
                                        )}
                                        {financialData.totalPOAmountPHP === 0 && financialData.totalPOAmountUSD === 0 && (
                                            <p className="text-2xl font-bold text-gray-400">-</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">
                                                {formatPercentage(financialData.budgetUtilizationPHP)} of budget
                                            </span>
                                            <span className="text-gray-600">
                                                {purchase_orders?.length || 0} POs
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(financialData.budgetUtilizationPHP, 100)}
                                            className={`h-2 ${
                                                financialData.budgetUtilizationPHP > 100 ? '[&>div]:bg-red-500' :
                                                    financialData.budgetUtilizationPHP >= 90 ? '[&>div]:bg-orange-500' :
                                                        '[&>div]:bg-purple-500'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Invoiced */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">Total Invoiced</p>
                                        <FileText className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        {financialData.totalInvoicedAmountPHP > 0 && (
                                            <p className="text-2xl font-bold text-orange-600">
                                                {formatCurrency(financialData.totalInvoicedAmountPHP, 'PHP')}
                                            </p>
                                        )}
                                        {financialData.totalInvoicedAmountUSD > 0 && (
                                            <p className="text-2xl font-bold text-orange-600">
                                                {formatCurrency(financialData.totalInvoicedAmountUSD, 'USD')}
                                            </p>
                                        )}
                                        {financialData.totalInvoicedAmountPHP === 0 && financialData.totalInvoicedAmountUSD === 0 && (
                                            <p className="text-2xl font-bold text-gray-400">-</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {financialData.totalPOAmountPHP > 0 && (
                                            <>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">PHP: {formatPercentage(financialData.invoicedProgressPHP)} of PO</span>
                                                </div>
                                                <Progress
                                                    value={Math.min(financialData.invoicedProgressPHP, 100)}
                                                    className="h-2 [&>div]:bg-orange-500"
                                                />
                                            </>
                                        )}
                                        {financialData.totalPOAmountUSD > 0 && (
                                            <>
                                                <div className="flex items-center justify-between text-xs mt-1">
                                                    <span className="text-gray-500">USD: {formatPercentage(financialData.invoicedProgressUSD)} of PO</span>
                                                </div>
                                                <Progress
                                                    value={Math.min(financialData.invoicedProgressUSD, 100)}
                                                    className="h-2 [&>div]:bg-orange-500"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Paid */}
                        <Card className="border-green-100 bg-green-50/50">
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">Total Paid</p>
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        {financialData.totalPaidAmountPHP > 0 && (
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(financialData.totalPaidAmountPHP, 'PHP')}
                                            </p>
                                        )}
                                        {financialData.totalPaidAmountUSD > 0 && (
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(financialData.totalPaidAmountUSD, 'USD')}
                                            </p>
                                        )}
                                        {financialData.totalPaidAmountPHP === 0 && financialData.totalPaidAmountUSD === 0 && (
                                            <p className="text-2xl font-bold text-gray-400">-</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-600">{financialData.paidInvoices} invoices</span>
                                        </div>
                                        {financialData.totalInvoicedAmountPHP > 0 && (
                                            <>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-green-600 font-medium">
                                                        PHP: {formatPercentage(financialData.paymentProgressPHP)} paid
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={Math.min(financialData.paymentProgressPHP, 100)}
                                                    className="h-2 bg-green-200 [&>div]:bg-green-600"
                                                />
                                            </>
                                        )}
                                        {financialData.totalInvoicedAmountUSD > 0 && (
                                            <>
                                                <div className="flex items-center justify-between text-xs mt-1">
                                                    <span className="text-green-600 font-medium">
                                                        USD: {formatPercentage(financialData.paymentProgressUSD)} paid
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={Math.min(financialData.paymentProgressUSD, 100)}
                                                    className="h-2 bg-green-200 [&>div]:bg-green-600"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Outstanding */}
                        <Card className={(financialData.totalOutstandingPHP > 0 || financialData.totalOutstandingUSD > 0) ? "border-orange-200 bg-orange-50/50" : ""}>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">Outstanding</p>
                                        <Clock className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        {financialData.totalOutstandingPHP > 0 && (
                                            <p className="text-2xl font-bold text-orange-600">
                                                {formatCurrency(financialData.totalOutstandingPHP, 'PHP')}
                                            </p>
                                        )}
                                        {financialData.totalOutstandingUSD > 0 && (
                                            <p className="text-2xl font-bold text-orange-600">
                                                {formatCurrency(financialData.totalOutstandingUSD, 'USD')}
                                            </p>
                                        )}
                                        {financialData.totalOutstandingPHP === 0 && financialData.totalOutstandingUSD === 0 && (
                                            <p className="text-2xl font-bold text-gray-400">-</p>
                                        )}
                                    </div>
                                    <div className="text-xs">
                                        {financialData.overdueInvoices > 0 ? (
                                            <div className="flex items-center gap-1 text-red-600 font-medium">
                                                <AlertTriangle className="h-3 w-3" />
                                                {financialData.overdueInvoices} overdue
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">
                                                {financialData.pendingInvoices} pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs Section */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="purchase-orders">
                                Purchase Orders
                                <Badge variant="secondary" className="ml-2">
                                    {purchase_orders?.length || 0}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="invoices">
                                Invoices
                                {financialData.pendingInvoices > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {financialData.pendingInvoices}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="vendors">Vendors</TabsTrigger>
                            <TabsTrigger value="remarks">
                                Remarks
                                <Badge variant="secondary" className="ml-2">
                                    {remarks.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="activity">
                                Activity
                                <Badge variant="secondary" className="ml-2">
                                    {activity_logs.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Project Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Project Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Hash className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium">CER Number</p>
                                                    <p className="text-sm text-gray-600">
                                                        {project.cer_number || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {project.project_type === 'sm_project' && (
                                                <div className="flex items-center gap-3">
                                                    <Hash className="h-4 w-4 text-purple-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">SMPO Number</p>
                                                        <p className="text-sm text-gray-600">
                                                            {project.smpo_number || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {project.project_type === 'philcom_project' && (
                                                <>
                                                    {project.philcom_category && (
                                                        <div className="flex items-center gap-3">
                                                            <Tag className="h-4 w-4 text-green-600" />
                                                            <div>
                                                                <p className="text-sm font-medium">Category</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {project.philcom_category}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {project.team && (
                                                        <div className="flex items-center gap-3">
                                                            <Users className="h-4 w-4 text-orange-600" />
                                                            <div>
                                                                <p className="text-sm font-medium">Team</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {project.team}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <CalendarDays className="h-4 w-4 text-purple-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Created</p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(project.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            {project.description && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-sm font-medium mb-1">Description</p>
                                                    <p className="text-sm text-gray-600">
                                                        {project.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Budget Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Budget Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* PHP Budget Section */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">PHP Budget Utilization</span>
                                                    <span className={`text-sm font-bold ${
                                                        financialData.budgetUtilizationPHP > 100 ? 'text-red-600' :
                                                            financialData.budgetUtilizationPHP > 90 ? 'text-orange-600' :
                                                                'text-green-600'
                                                    }`}>
                                                        {formatPercentage(financialData.budgetUtilizationPHP)}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={Math.min(financialData.budgetUtilizationPHP, 100)}
                                                    className={`h-3 ${
                                                        financialData.budgetUtilizationPHP > 100 ? '[&>div]:bg-red-500' :
                                                            financialData.budgetUtilizationPHP > 90 ? '[&>div]:bg-orange-500' :
                                                                '[&>div]:bg-green-500'
                                                    }`}
                                                />
                                            </div>

                                            {/* PHP Financial Breakdown */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Project Budget:</span>
                                                    <span className="font-semibold">
                                                        {formatCurrency(financialData.totalProjectCost, 'PHP')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">PHP PO Committed:</span>
                                                    <span className="font-semibold text-purple-600">
                                                        {formatCurrency(financialData.totalPOAmountPHP, 'PHP')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t">
                                                    <span className={`text-sm font-medium ${
                                                        financialData.remainingBudgetPHP >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {financialData.remainingBudgetPHP >= 0 ? 'Remaining:' : 'Over Budget:'}
                                                    </span>
                                                    <span className={`font-bold ${
                                                        financialData.remainingBudgetPHP >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {formatCurrency(Math.abs(financialData.remainingBudgetPHP), 'PHP')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* USD Section - if exists */}
                                            {financialData.hasUSDPOs && (
                                                <div className="pt-4 border-t">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium">USD Purchase Orders</span>
                                                        <span className="text-sm font-semibold text-purple-600">
                                                            {formatCurrency(financialData.totalPOAmountUSD, 'USD')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Project budget is PHP-only. USD POs tracked separately.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Receipt className="h-5 w-5" />
                                            Payment Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* PHP Payment Progress */}
                                            {financialData.totalInvoicedAmountPHP > 0 && (
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm font-medium">PHP Payment Progress</span>
                                                        <span className="text-sm font-bold text-green-600">
                                                            {formatPercentage(financialData.paymentProgressPHP)}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={Math.min(financialData.paymentProgressPHP, 100)}
                                                        className="h-3 bg-green-200 [&>div]:bg-green-600"
                                                    />
                                                    <div className="space-y-2 mt-3">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Invoiced:</span>
                                                            <span className="font-semibold">
                                                                {formatCurrency(financialData.totalInvoicedAmountPHP, 'PHP')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Paid:</span>
                                                            <span className="font-semibold text-green-600">
                                                                {formatCurrency(financialData.totalPaidAmountPHP, 'PHP')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Outstanding:</span>
                                                            <span className="font-semibold text-orange-600">
                                                                {formatCurrency(financialData.totalOutstandingPHP, 'PHP')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* USD Payment Progress */}
                                            {financialData.totalInvoicedAmountUSD > 0 && (
                                                <div className={financialData.totalInvoicedAmountPHP > 0 ? "pt-4 border-t" : ""}>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm font-medium">USD Payment Progress</span>
                                                        <span className="text-sm font-bold text-green-600">
                                                            {formatPercentage(financialData.paymentProgressUSD)}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={Math.min(financialData.paymentProgressUSD, 100)}
                                                        className="h-3 bg-green-200 [&>div]:bg-green-600"
                                                    />
                                                    <div className="space-y-2 mt-3">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Invoiced:</span>
                                                            <span className="font-semibold">
                                                                {formatCurrency(financialData.totalInvoicedAmountUSD, 'USD')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Paid:</span>
                                                            <span className="font-semibold text-green-600">
                                                                {formatCurrency(financialData.totalPaidAmountUSD, 'USD')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Outstanding:</span>
                                                            <span className="font-semibold text-orange-600">
                                                                {formatCurrency(financialData.totalOutstandingUSD, 'USD')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Overdue Warning */}
                                            {financialData.overdueInvoices > 0 && (
                                                <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                                        <span className="text-sm font-medium text-red-600">Overdue:</span>
                                                    </div>
                                                    <span className="font-bold text-red-600">
                                                        {financialData.overdueInvoices} invoices
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats Grid */}
                                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Package className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                                            <p className="text-2xl font-bold">{purchase_orders?.length || 0}</p>
                                            <p className="text-xs text-gray-600">Total POs</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Receipt className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                                            <p className="text-2xl font-bold">
                                                {purchase_orders?.reduce((sum, po) => sum + (po.invoices?.length || 0), 0) || 0}
                                            </p>
                                            <p className="text-xs text-gray-600">Total Invoices</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                                            <p className="text-2xl font-bold">{financialData.paidInvoices}</p>
                                            <p className="text-xs text-gray-600">Paid</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                                            <p className="text-2xl font-bold">{financialData.pendingInvoices}</p>
                                            <p className="text-xs text-gray-600">Pending</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Activity */}
                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Activity className="h-5 w-5" />
                                                Recent Remarks
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setActiveTab('remarks')}
                                            >
                                                View All
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {remarks.length > 0 ? (
                                                remarks.slice(0, 5).map((remark) => (
                                                    <div key={remark.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-xs text-gray-500">
                                                                {formatDate(remark.created_at)}
                                                            </p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {remark.user?.name || 'Unknown'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{remark.remark_text}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">
                                                    No remarks yet
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Purchase Orders Tab */}
                        <TabsContent value="purchase-orders" className="mt-6">
                            <div className="space-y-6">
                                {/* PO Status Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">Open</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {financialData.poStatusCounts?.open || 0}
                                                    </p>
                                                </div>
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">Closed</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {financialData.poStatusCounts?.closed || 0}
                                                    </p>
                                                </div>
                                                <CheckCircle className="h-8 w-8 text-blue-600" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">Draft</p>
                                                    <p className="text-2xl font-bold text-yellow-600">
                                                        {financialData.poStatusCounts?.draft || 0}
                                                    </p>
                                                </div>
                                                <Clock className="h-8 w-8 text-yellow-600" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">Cancelled</p>
                                                    <p className="text-2xl font-bold text-red-600">
                                                        {financialData.poStatusCounts?.cancelled || 0}
                                                    </p>
                                                </div>
                                                <XCircle className="h-8 w-8 text-red-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* PO List */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Purchase Orders
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {purchase_orders && purchase_orders.length > 0 ? (
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>PO Number</TableHead>
                                                            <TableHead>Vendor</TableHead>
                                                            <TableHead>Date</TableHead>
                                                            <TableHead className="text-right">Amount</TableHead>
                                                            <TableHead className="text-center">Status</TableHead>
                                                            <TableHead className="text-center">Invoices</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {purchase_orders.map((po) => (
                                                            <TableRow key={po.id}>
                                                                <TableCell className="font-medium">
                                                                    {po.po_number}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Link
                                                                        href={route('vendors.show', po.vendor?.id)}
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        {po.vendor?.name || 'No vendor'}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatDate(po.po_date)}
                                                                </TableCell>
                                                                <TableCell className="text-right font-semibold">
                                                                    {formatCurrency(po.po_amount, po.currency)}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <StatusBadge status={po.po_status} />
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge variant="outline">
                                                                        {po.invoices?.length || 0}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        asChild
                                                                    >
                                                                        <Link href={route('purchase-orders.show', po.id)}>
                                                                            View
                                                                        </Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium mb-2">No Purchase Orders</p>
                                                <p className="text-sm mb-4">Get started by creating your first purchase order</p>
                                                {canWrite('purchase_orders') && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => router.get(`/purchase-orders/create?project_id=${project.id}`)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Create First PO
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices" className="mt-6">
                            <InvoicesList
                                invoices={purchase_orders?.flatMap(po =>
                                    (po.invoices || []).map(invoice => ({
                                        ...invoice,
                                        po_number: po.po_number,
                                        purchase_order_id: po.id,
                                        vendor_name: po.vendor?.name,
                                        project_title: project.project_title
                                    }))
                                ) || []}
                                variant="table"
                                hideColumns={['project']}
                                showSummaryCards
                                showToolbar
                                enableOverdueHighlight
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                emptyStateTitle="No Invoices"
                                emptyStateDescription="Invoices will appear here once they are created for purchase orders"
                            />
                        </TabsContent>

                        {/* Vendors Tab */}
                        <TabsContent value="vendors" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Vendor Summary
                                    </CardTitle>
                                    <CardDescription>
                                        Financial breakdown by vendor
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {financialData.vendorSummary && financialData.vendorSummary.length > 0 ? (
                                        <div className="space-y-4">
                                            {financialData.vendorSummary
                                                .sort((a, b) => b.totalPOAmount - a.totalPOAmount)
                                                .map((vendor, index) => (
                                                    <Card key={index} className="border-l-4 border-l-blue-500">
                                                        <CardContent className="p-6">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                                        {vendor.name}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge variant="outline">
                                                                            {vendor.poCount} PO{vendor.poCount !== 1 ? 's' : ''}
                                                                        </Badge>
                                                                        <Badge variant="secondary">
                                                                            {vendor.invoiceCount} Invoice{vendor.invoiceCount !== 1 ? 's' : ''}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link href={route('vendors.show', vendor?.id)}>
                                                                        View Details
                                                                    </Link>
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600 mb-1">PO Amount</p>
                                                                    <div className="space-y-1">
                                                                        {vendor.totalPOAmountPHP > 0 && (
                                                                            <p className="text-xl font-bold text-purple-600">
                                                                                {formatCurrency(vendor.totalPOAmountPHP, 'PHP')}
                                                                            </p>
                                                                        )}
                                                                        {vendor.totalPOAmountUSD > 0 && (
                                                                            <p className="text-xl font-bold text-purple-600">
                                                                                {formatCurrency(vendor.totalPOAmountUSD, 'USD')}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm text-gray-600 mb-1">Invoiced</p>
                                                                    <div className="space-y-1">
                                                                        {vendor.totalInvoicedPHP > 0 && (
                                                                            <>
                                                                                <p className="text-xl font-bold text-orange-600">
                                                                                    {formatCurrency(vendor.totalInvoicedPHP, 'PHP')}
                                                                                </p>
                                                                                {vendor.totalPOAmountPHP > 0 && (
                                                                                    <Progress
                                                                                        value={Math.min((vendor.totalInvoicedPHP / vendor.totalPOAmountPHP) * 100, 100)}
                                                                                        className="h-2"
                                                                                    />
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {vendor.totalInvoicedUSD > 0 && (
                                                                            <>
                                                                                <p className="text-xl font-bold text-orange-600">
                                                                                    {formatCurrency(vendor.totalInvoicedUSD, 'USD')}
                                                                                </p>
                                                                                {vendor.totalPOAmountUSD > 0 && (
                                                                                    <Progress
                                                                                        value={Math.min((vendor.totalInvoicedUSD / vendor.totalPOAmountUSD) * 100, 100)}
                                                                                        className="h-2"
                                                                                    />
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm text-gray-600 mb-1">Paid</p>
                                                                    <div className="space-y-1">
                                                                        {vendor.totalPaidPHP > 0 && (
                                                                            <>
                                                                                <p className="text-xl font-bold text-green-600">
                                                                                    {formatCurrency(vendor.totalPaidPHP, 'PHP')}
                                                                                </p>
                                                                                {vendor.totalInvoicedPHP > 0 && (
                                                                                    <Progress
                                                                                        value={Math.min((vendor.totalPaidPHP / vendor.totalInvoicedPHP) * 100, 100)}
                                                                                        className="h-2 bg-green-200 [&>div]:bg-green-600"
                                                                                    />
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {vendor.totalPaidUSD > 0 && (
                                                                            <>
                                                                                <p className="text-xl font-bold text-green-600">
                                                                                    {formatCurrency(vendor.totalPaidUSD, 'USD')}
                                                                                </p>
                                                                                {vendor.totalInvoicedUSD > 0 && (
                                                                                    <Progress
                                                                                        value={Math.min((vendor.totalPaidUSD / vendor.totalInvoicedUSD) * 100, 100)}
                                                                                        className="h-2 bg-green-200 [&>div]:bg-green-600"
                                                                                    />
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                                                                    <div className="space-y-1">
                                                                        {vendor.outstandingPHP > 0 && (
                                                                            <p className="text-xl font-bold text-orange-600">
                                                                                {formatCurrency(vendor.outstandingPHP, 'PHP')}
                                                                            </p>
                                                                        )}
                                                                        {vendor.outstandingUSD > 0 && (
                                                                            <p className="text-xl font-bold text-orange-600">
                                                                                {formatCurrency(vendor.outstandingUSD, 'USD')}
                                                                            </p>
                                                                        )}
                                                                        {(vendor.outstandingPHP > 0 || vendor.outstandingUSD > 0) && (
                                                                            <Badge variant="secondary" className="mt-2">
                                                                                Payment Due
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium mb-2">No Vendors</p>
                                            <p className="text-sm">Vendors will appear here once purchase orders are created</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Remarks Tab */}
                        <TabsContent value="remarks" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin mx-auto" />}>
                                <Remarks
                                    remarkableType="Project"
                                    remarkableId={project.id}
                                    remarks={remarks}
                                />
                            </Suspense>
                        </TabsContent>

                        {/* Activity Tab */}
                        <TabsContent value="activity" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin mx-auto" />}>
                                <ActivityTimeline
                                    activity_logs={activity_logs}
                                    title="Project Activity History"
                                    entityType="project"
                                />
                            </Suspense>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
);
}
