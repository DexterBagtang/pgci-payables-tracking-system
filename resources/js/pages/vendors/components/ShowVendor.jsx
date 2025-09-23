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
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Plus,
    Edit,
    TrendingUp,
    Clock,
    DollarSign,
    ShoppingCart,
    Loader,
    CheckCircle,
    XCircle,
    Package, ArrowLeft
} from 'lucide-react';
import {getUniqueProjectsWithFormattedDate} from "@/components/custom/helpers.jsx";
import {Link} from "@inertiajs/react";
import BackButton from '@/components/custom/BackButton.jsx';
const VendorProjects = lazy(()=> import('@/pages/vendors/components/VendorProjects.jsx'));
const EditVendorDialog = lazy(()=> import("@/pages/vendors/components/EditVendorDialog.jsx"));
const VendorPO = lazy(()=> import('@/pages/vendors/components/VendorPO.jsx'));
const Remarks = lazy(() => import("@/components/custom/Remarks.jsx"));

export default function ShowVendor({vendor,backUrl}){
    const [activeTab, setActiveTab] = useState('overview');
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const {purchase_orders,remarks} = vendor;

    // Calculate completion rate
    const completionRate = purchase_orders.length > 0
        ? Math.round((purchase_orders.filter(po => po.po_status === 'closed').length / purchase_orders.length) * 100)
        : 0;

    // Get unique projects count
    const uniqueProjects = [...new Set(purchase_orders.map(po => po.project.project_title))].length;

    const metrics = {
        total_pos: purchase_orders.length,
        active_pos: purchase_orders.reduce((count,po)=>po.po_status === 'open' ? count+1 : count,0),
        total_contract_value: purchase_orders.reduce((count,po)=> count + po.po_amount,0),
        completion_rate: completionRate,
        projects_count: uniqueProjects
    };

    // Sample projects data
    const projects = getUniqueProjectsWithFormattedDate(purchase_orders);


    const getStatusBadge = (status) => {
        const statusConfig = {
            open: { variant: "default", icon: CheckCircle, color: "text-green-600" },
            draft: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
            closed: { variant: "outline", icon: CheckCircle, color: "text-blue-600" },
            cancelled: { variant: "destructive", icon: XCircle, color: "text-red-600" }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className={`h-3 w-3 ${config.color}`} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                                        <Badge variant={vendor.is_active ? "default" : "secondary"}>
                                            {vendor.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600">{vendor.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <BackButton />
                                <Button variant="outline" onClick={()=>setEditDialogOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Vendor
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{metrics.total_pos}</p>
                                        <p className="text-sm text-gray-600">Total POs</p>
                                    </div>
                                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{metrics.active_pos}</p>
                                        <p className="text-sm text-gray-600">Active POs</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{formatCurrency(metrics.total_contract_value)}</p>
                                        <p className="text-sm text-gray-600">Total Value</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{metrics.completion_rate}%</p>
                                        <p className="text-sm text-gray-600">Completion Rate</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{metrics.projects_count}</p>
                                        <p className="text-sm text-gray-600">Projects</p>
                                    </div>
                                    <Package className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Tabs Section */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="remarks">Remarks <Badge variant='secondary' className="ml-2" >{remarks.length}</Badge></TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Vendor Details Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Vendor Details
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
                                            {/* Email */}
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Email</p>
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.email || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.phone || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Terms */}
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="h-4 w-4 text-red-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Payment Terms</p>
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.payment_terms || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Address Card - Only show if address exists */}
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-gray-600 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium">Address</p>
                                                    <p className="text-gray-600">{vendor.address}</p>
                                                </div>
                                            </div>


                                            {/* Created At */}
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-purple-600" />
                                                <div>
                                                    <p className="text-sm font-medium">Created</p>
                                                    <p className="text-sm text-gray-600">
                                                        {vendor.created_at ? formatDate(vendor.created_at) : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                                {/* Recent Remarks */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Recent Remarks</CardTitle>
                                            <Button variant="ghost" size="sm">View All</Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {remarks.slice(0, 3).map((remark) => (
                                                <div key={remark.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs text-gray-500">{formatDate(remark.created_at)}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-1">{remark.remark_text}</p>
                                                    <p className="text-xs text-gray-500">by {remark.user.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="pos" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin" />}>
                                <VendorPO purchase_orders={purchase_orders} />
                            </Suspense>

                        </TabsContent>

                        <TabsContent value="projects" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin" />}>
                                <VendorProjects projects={projects} />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="remarks" className="mt-6">
                            <Suspense fallback={<Loader className="animate-spin" />}>
                                <Remarks remarkableType="Vendor" remarkableId={vendor.id} remarks={remarks} />
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
                    onSuccess={()=>{}}
                />
            </Suspense>
        </>
    );
};


