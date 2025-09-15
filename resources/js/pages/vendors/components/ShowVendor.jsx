import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    FileText,
    Plus,
    Edit,
    MoreHorizontal,
    TrendingUp,
    Clock,
    DollarSign,
    ShoppingCart,
    Upload,
    MessageSquare,
    Eye,
    CheckCircle,
    AlertCircle,
    XCircle,
    Users,
    Package, ArrowLeft
} from 'lucide-react';
import EditVendorDialog from "@/pages/vendors/components/EditVendorDialog.jsx";
import {getUniqueProjectsWithFormattedDate} from "@/components/custom/helpers.jsx";
import {Link} from "@inertiajs/react";
import Remarks from "@/components/custom/Remarks.jsx";

const ShowVendor = ({vendor,backUrl}) => {
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

    // Sample files data
    const files = [
        { id: 1, name: "Contract_Agreement_2024.pdf", type: "pdf", category: "Contract", uploaded_at: "2024-01-20", size: "2.4 MB" },
        { id: 2, name: "Tax_Certificate.pdf", type: "pdf", category: "Tax Document", uploaded_at: "2024-02-15", size: "1.1 MB" },
        { id: 3, name: "Business_License.jpg", type: "image", category: "License", uploaded_at: "2024-01-25", size: "856 KB" }
    ];


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

    const getPriorityBadge = (priority) => {
        const colors = {
            High: "bg-red-100 text-red-800",
            Medium: "bg-yellow-100 text-yellow-800",
            Low: "bg-green-100 text-green-800"
        };

        return (
            <Badge variant="outline" className={colors[priority]}>
                {priority}
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
                                <Link href={backUrl}>
                                    <Button variant="outline" >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <Button variant="outline" onClick={()=>setEditDialogOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Vendor
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload File
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Add Remark
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View History
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="files">Files</TabsTrigger>
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Purchase Orders</CardTitle>
                                    <CardDescription>
                                        All purchase orders for this vendor
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {vendor.purchase_orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingCart className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders</h3>
                                            <p className="text-gray-500 mb-6">This vendor doesn't have any purchase orders yet.</p>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create First PO
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {vendor.purchase_orders.map((po) => (
                                                <Card key={po.id} className="shadow-sm border">
                                                    <CardHeader className="pb-2">
                                                        <h3 className="font-semibold text-sm ">
                                                            #{po.po_number}
                                                        </h3>
                                                        <p className="text-base truncate">
                                                            {po.project.project_title}
                                                        </p>
                                                    </CardHeader>

                                                    <CardContent className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">PO Date:</span>
                                                            <span className="text-gray-600">{formatDate(po.po_date)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Expected Delivery:</span>
                                                            <span className="text-gray-600">{formatDate(po.expected_delivery)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t">
                                                            <span className="font-medium">{formatCurrency(po.po_amount)}</span>
                                                            {getStatusBadge(po.po_status)}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="projects" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Associated Projects</CardTitle>
                                    <CardDescription>Projects where this vendor has been involved</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {projects.map((project) => (
                                            <div key={project.id} className="flex items-center justify-between border rounded-lg p-4">
                                                <div>
                                                    <p className="font-medium">{project.title}</p>
                                                    <p className="text-sm text-gray-600">{project.cer_number}</p>
                                                    <p className="text-xs text-gray-500">Last PO: {formatDate(project.last_po_date)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{project.po_count} POs</p>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="files" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Files & Documents</CardTitle>
                                            <CardDescription>Vendor-related documents and files</CardDescription>
                                        </div>
                                        <Button>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload File
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {files.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between border rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium">{file.name}</p>
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline">{file.category}</Badge>
                                                            <span className="text-sm text-gray-500">{file.size}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">Uploaded {formatDate(file.uploaded_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="remarks" className="mt-6">
                            <Remarks remarkableType="Vendor" remarkableId={vendor.id} remarks={remarks} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <EditVendorDialog
                vendor={vendor}
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={()=>{}}
            />
        </>
    );
};

export default ShowVendor;

