import { lazy, Suspense, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Badge
} from '@/components/ui/badge';
import {
    Button
} from '@/components/ui/button';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Progress
} from '@/components/ui/progress';

import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Edit,
    TrendingUp,
    Clock,
    DollarSign,
    ShoppingCart,
    Loader,
    CheckCircle,
    XCircle,
    Package,
    AlertTriangle,
    FileText,
    CreditCard,
    Activity
} from 'lucide-react';
import { getUniqueProjectsWithFormattedDate } from "@/components/custom/helpers.jsx";
import BackButton from '@/components/custom/BackButton.jsx';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import { useRemember } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';

const VendorProjects = lazy(() => import('@/pages/vendors/components/VendorProjects.jsx'));
const EditVendorDialog = lazy(() => import("@/pages/vendors/components/EditVendorDialog.jsx"));
const VendorPO = lazy(() => import('@/pages/vendors/components/VendorPO.jsx'));
const InvoicesList = lazy(() => import('@/components/custom/InvoicesList.jsx'));
const Remarks = lazy(() => import("@/components/custom/Remarks.jsx"));
const ActivityTimeline = lazy(() => import("@/components/custom/ActivityTimeline.jsx"));

export default function ShowVendor({ vendor }) {
    const { canWrite } = usePermissions();
    const [activeTab, setActiveTab] = useRemember('overview','vendor-detail-tab');
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const { purchase_orders, remarks, financial_summary, activity_logs = [] } = vendor;

    // Financial calculations from backend
    const {
        total_po_amount = 0,
        total_invoiced = 0,
        total_invoice = 0,
        total_paid = 0,
        outstanding_balance = 0,
        overdue_amount = 0,
        pending_invoices = 0,
        paid_invoices = 0,
        overdue_invoices = 0,
        average_payment_days = 0,
    } = financial_summary || {};

    // Calculate metrics
    const paymentProgress = total_invoiced > 0
        ? Math.round((total_paid / total_invoiced) * 100)
        : 0;

    const invoicedProgress = total_po_amount > 0
        ? Math.round((total_invoiced / total_po_amount) * 100)
        : 0;

    const uniqueProjects = getUniqueProjectsWithFormattedDate(purchase_orders);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'text-green-600',
            inactive: 'text-gray-500',
            overdue: 'text-red-600',
            warning: 'text-orange-600'
        };
        return colors[status] || 'text-gray-600';
    };

    // Determine vendor health status
    const getVendorHealthStatus = () => {
        if (overdue_amount > 0) {
            return { status: 'overdue', label: 'Overdue Payments', color: 'red' };
        }
        if (outstanding_balance > total_invoiced * 0.5) {
            return { status: 'warning', label: 'High Outstanding', color: 'orange' };
        }
        if (outstanding_balance > 0) {
            return { status: 'pending', label: 'Pending Payments', color: 'blue' };
        }
        return { status: 'good', label: 'All Clear', color: 'green' };
    };

    const healthStatus = getVendorHealthStatus();

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                                        <StatusBadge status={vendor.is_active ? "active" : "inactive"} />
                                        <Badge
                                            variant="outline"
                                            className={`border-${healthStatus.color}-200 text-${healthStatus.color}-700 bg-${healthStatus.color}-50`}
                                        >
                                            {healthStatus.label}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600">{vendor.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <BackButton />
                                {canWrite('vendors') && (
                                    <Button size="sm" onClick={() => setEditDialogOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Vendor
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Overview Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total PO Amount */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">Total PO Amount</p>
                                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold">{formatCurrency(total_po_amount)}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Package className="h-3 w-3" />
                                        {purchase_orders.length} Purchase Orders
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
                                        <FileText className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(total_invoiced)}
                                    </p>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">{invoicedProgress}% of PO</span>
                                            <span className="text-gray-500">
                                                {total_invoice} invoices
                                            </span>
                                        </div>
                                        <Progress value={invoicedProgress} className="h-1" />
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
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(total_paid)}
                                    </p>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-green-600 font-medium">
                                                {paymentProgress}% paid
                                            </span>
                                            <span className="text-gray-600">
                                                {paid_invoices} invoices
                                            </span>
                                        </div>
                                        <Progress value={paymentProgress} className="h-1 bg-green-200" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Outstanding Balance */}
                        <Card className={outstanding_balance > 0 ? "border-orange-200 bg-orange-50/50" : ""}>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600">Outstanding</p>
                                        <Clock className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <p className={`text-2xl font-bold ${outstanding_balance > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                                        {formatCurrency(outstanding_balance)}
                                    </p>
                                    <div className="text-xs">
                                        {overdue_amount > 0 ? (
                                            <div className="flex items-center gap-1 text-red-600 font-medium">
                                                <AlertTriangle className="h-3 w-3" />
                                                {formatCurrency(overdue_amount)} overdue ({overdue_invoices})
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">
                                                {pending_invoices} pending invoices
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Projects</p>
                                        <p className="text-xl font-bold">{uniqueProjects.length}</p>
                                    </div>
                                    <Package className="h-6 w-6 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Payment Days</p>
                                        <p className="text-xl font-bold">{average_payment_days}</p>
                                    </div>
                                    <Activity className="h-6 w-6 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Terms</p>
                                        <p className="text-lg font-semibold">{vendor.payment_terms || 'N/A'}</p>
                                    </div>
                                    <CreditCard className="h-6 w-6 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Vendor Type</p>
                                        <p className="text-lg font-semibold">{vendor.vendor_type || 'General'}</p>
                                    </div>
                                    <Building2 className="h-6 w-6 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs Section */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-7">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="financials">Financials</TabsTrigger>
                            <TabsTrigger value="invoices">
                                Invoices
                                {pending_invoices > 0 && (
                                    <Badge variant="secondary" className="ml-2">{pending_invoices}</Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="remarks">
                                Remarks
                                <Badge variant="secondary" className="ml-2">{remarks.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="activity">
                                Activity
                                <Badge variant="secondary" className="ml-2">{activity_logs.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Vendor Details Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Vendor Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Contact Person</p>
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.contact_person || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Email</p>
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.email || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.phone || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-4 w-4 text-red-600 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium">Address</p>
                                                    <p className="text-sm text-gray-600">{vendor.address || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-purple-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Created</p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(vendor.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Health Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Payment Health
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Overall Payment Progress */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">Overall Payment Progress</span>
                                                    <span className="text-sm font-bold text-green-600">
                                                        {paymentProgress}%
                                                    </span>
                                                </div>
                                                <Progress value={paymentProgress} className="h-3" />
                                            </div>

                                            {/* Invoice Progress */}
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">Invoice Coverage</span>
                                                    <span className="text-sm font-bold text-purple-600">
                                                        {invoicedProgress}%
                                                    </span>
                                                </div>
                                                <Progress value={invoicedProgress} className="h-3 bg-purple-200" />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatCurrency(total_po_amount - total_invoiced)} not yet invoiced
                                                </p>
                                            </div>

                                            {/* Financial Breakdown */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">PO Commitment:</span>
                                                    <span className="font-semibold">{formatCurrency(total_po_amount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Invoiced:</span>
                                                    <span className="font-semibold text-purple-600">
                                                        {formatCurrency(total_invoiced)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Paid:</span>
                                                    <span className="font-semibold text-green-600">
                                                        {formatCurrency(total_paid)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t">
                                                    <span className="text-sm font-medium text-orange-600">Outstanding:</span>
                                                    <span className="font-bold text-orange-600">
                                                        {formatCurrency(outstanding_balance)}
                                                    </span>
                                                </div>
                                                {overdue_amount > 0 && (
                                                    <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-200">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                                            <span className="text-sm font-medium text-red-600">Overdue:</span>
                                                        </div>
                                                        <span className="font-bold text-red-600">
                                                            {formatCurrency(overdue_amount)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card className="lg:col-span-2">
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
                                                                {remark.user.name}
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

                        {/* Financials Tab - NEW */}
                        <TabsContent value="financials" className="mt-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-gray-600">
                                                Invoice Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        Paid
                                                    </span>
                                                    <span className="font-semibold">{paid_invoices}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-orange-600" />
                                                        Pending
                                                    </span>
                                                    <span className="font-semibold">{pending_invoices}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                                        Overdue
                                                    </span>
                                                    <span className="font-semibold text-red-600">{overdue_invoices}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-gray-600">
                                                Payment Performance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-2xl font-bold">{average_payment_days}</p>
                                                    <p className="text-xs text-gray-600">Average Days to Pay</p>
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <p className="text-sm text-gray-600">Terms: {vendor.payment_terms || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-gray-600">
                                                Uninvoiced Balance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {formatCurrency(total_po_amount - total_invoiced)}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {invoicedProgress}% of PO amount invoiced
                                                </p>
                                                <Progress value={invoicedProgress} className="h-2" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Payment Timeline would go here */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Financial Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-600">Purchase Orders</p>
                                                    <p className="text-xl font-bold">{formatCurrency(total_po_amount)}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-600">Total Invoiced</p>
                                                    <p className="text-xl font-bold text-purple-600">
                                                        {formatCurrency(total_invoiced)}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-600">Total Paid</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {formatCurrency(total_paid)}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-600">Balance Due</p>
                                                    <p className="text-xl font-bold text-orange-600">
                                                        {formatCurrency(outstanding_balance)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin mx-auto" />}>
                                <InvoicesList
                                    invoices={purchase_orders.flatMap(po =>
                                        (po.invoices || []).map(invoice => ({
                                            ...invoice,
                                            po_number: po.po_number,
                                            purchase_order_id: po.id,
                                            project_title: po.project?.project_title,
                                            vendor_name: vendor.name
                                        }))
                                    )}
                                    variant="table"
                                    hideColumns={['vendor']}
                                    showSummaryCards
                                    showToolbar
                                    enableOverdueHighlight
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            </Suspense>
                        </TabsContent>

                        {/* Purchase Orders Tab */}
                        <TabsContent value="pos" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin mx-auto" />}>
                                <VendorPO purchase_orders={purchase_orders} />
                            </Suspense>
                        </TabsContent>

                        {/* Projects Tab */}
                        <TabsContent value="projects" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin mx-auto" />}>
                                <VendorProjects projects={uniqueProjects} />
                            </Suspense>
                        </TabsContent>

                        {/* Remarks Tab */}
                        <TabsContent value="remarks" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin mx-auto" />}>
                                <Remarks
                                    remarkableType="Vendor"
                                    remarkableId={vendor.id}
                                    remarks={remarks}
                                />
                            </Suspense>
                        </TabsContent>

                        {/* Activity Tab */}
                        <TabsContent value="activity" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin mx-auto" />}>
                                <ActivityTimeline
                                    activity_logs={activity_logs}
                                    title="Vendor Activity History"
                                    entityType="vendor"
                                />
                            </Suspense>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Suspense fallback={null}>
                <EditVendorDialog
                    vendor={vendor}
                    isOpen={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onSuccess={() => {}}
                />
            </Suspense>
        </>
    );
}
