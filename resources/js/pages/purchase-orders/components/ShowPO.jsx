import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Label } from '@/components/ui/label.js';
import { Separator } from '@/components/ui/separator.js';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Edit,
    FileText,
    Building2,
    User,
    Clock,
    DownloadIcon,
    Calendar,
    DollarSign,
    Package,
    Receipt,
    CreditCard,
    Truck
} from 'lucide-react';
import { useState } from 'react';
import EditPOForm from '@/pages/purchase-orders/components/EditPOForm.jsx';
import { formatFileSize, getFileIcon } from '@/components/custom/helpers.jsx';

export default function ShowPO({ purchaseOrder, vendors, projects }) {
    const [isEditing, setIsEditing] = useState(false);

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM dd, yyyy');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { variant: 'outline', label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
            open: { variant: 'default', label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-300' },
            approved: { variant: 'default', label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300' },
            completed: { variant: 'default', label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
            cancelled: { variant: 'destructive', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-300' },
        };

        const config = statusConfig[status] || statusConfig.open;
        return <Badge variant="outline" className={`${config.color} font-medium text-xs`}>{config.label}</Badge>;
    };

    if (isEditing) {
        return (
            <EditPOForm
                purchaseOrder={purchaseOrder}
                vendors={vendors}
                projects={projects}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => setIsEditing(false)}
            />
        );
    }

    const vatExAmount = (parseFloat(purchaseOrder.po_amount) || 0) / 1.12;
    const vatAmount = ((parseFloat(purchaseOrder.po_amount) || 0) * 0.12) / 1.12;

    return (
        <>
            <Head title={`Purchase Order - ${purchaseOrder.po_number}`} />

            <div className="min-h-screen bg-gray-50/50 py-4">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-4">
                        <div className="mb-4 flex items-center justify-between">
                            <Button variant="outline" size="sm" asChild className="gap-2">
                                <Link href="/purchase-orders">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Purchase Orders
                                </Link>
                            </Button>
                            <Button size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit PO
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {purchaseOrder.po_number || 'Draft Purchase Order'}
                                    </h1>
                                    {getStatusBadge(purchaseOrder.po_status)}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>PO Date: {formatDate(purchaseOrder.po_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Created: {formatDate(purchaseOrder.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                    {formatCurrency(purchaseOrder.po_amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Total Amount
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Description */}
                            {purchaseOrder.description && (
                                <Card className="shadow-sm border-gray-200/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            Description
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                                {purchaseOrder.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Vendor & Project */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Vendor */}
                                {purchaseOrder.vendor && (
                                    <Card className="shadow-sm border-gray-200/60">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                                <User className="h-4 w-4 text-blue-600" />
                                                Vendor
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 pt-2">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500">Company Name</Label>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{purchaseOrder.vendor.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500">Category</Label>
                                                <p className="text-sm text-gray-700 mt-1">{purchaseOrder.vendor.category || 'General Supplier'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Project */}
                                {purchaseOrder.project && (
                                    <Card className="shadow-sm border-gray-200/60">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                                <Building2 className="h-4 w-4 text-green-600" />
                                                Project
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 pt-2">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500">Project Title</Label>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{purchaseOrder.project.project_title}</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {purchaseOrder.project.cer_number && (
                                                    <div>
                                                        <Label className="text-xs font-medium text-gray-500">CER Number</Label>
                                                        <p className="text-sm text-gray-700 mt-1">{purchaseOrder.project.cer_number}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500">Type</Label>
                                                    <p className="text-sm text-gray-700 mt-1 capitalize">
                                                        {purchaseOrder.project.project_type?.replace('_', ' ') || 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                            {purchaseOrder.project.project_type === 'philcom_project' && purchaseOrder.project.philcom_category && (
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500">Philcom Category</Label>
                                                    <p className="text-sm text-gray-700 mt-1 capitalize">
                                                        {purchaseOrder.project.philcom_category.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            )}
                                            {purchaseOrder.project.project_type !== 'philcom_project' && purchaseOrder.project.smpo_number && (
                                                <div>
                                                    <Label className="text-xs font-medium text-gray-500">SMPO Number</Label>
                                                    <p className="text-sm text-gray-700 mt-1">{purchaseOrder.project.smpo_number}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Additional Details - Only show if they exist */}
                            {(purchaseOrder.expected_delivery_date || purchaseOrder.payment_term) && (
                                <Card className="shadow-sm border-gray-200/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-semibold text-gray-900">Additional Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {purchaseOrder.expected_delivery_date && (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-orange-50 rounded-md">
                                                        <Truck className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs font-medium text-gray-500">Expected Delivery</Label>
                                                        <p className="text-sm font-semibold text-gray-900">{formatDate(purchaseOrder.expected_delivery_date)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {purchaseOrder.payment_term && (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-purple-50 rounded-md">
                                                        <CreditCard className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs font-medium text-gray-500">Payment Terms</Label>
                                                        <p className="text-sm font-semibold text-gray-900">{purchaseOrder.payment_term}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Attachments */}
                            {purchaseOrder.files && purchaseOrder.files.length > 0 && (
                                <Card className="shadow-sm border-gray-200/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            <Package className="h-4 w-4 text-purple-600" />
                                            Attachments
                                            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700 text-xs">
                                                {purchaseOrder.files.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="space-y-2">
                                            {purchaseOrder.files.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="p-1.5 bg-gray-50 rounded-md">
                                                            {getFileIcon(file.file_type)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 truncate text-sm">{file.file_name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {formatFileSize(file.file_size)} • Uploaded {new Date(file.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild className="shrink-0 ml-3">
                                                        <a
                                                            href={`/storage/${file.file_path}`}
                                                            download={file.file_name}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <DownloadIcon className="h-3 w-3" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Financial Summary */}
                            <Card className="shadow-sm border-gray-200/60 bg-gradient-to-br from-green-50/80 to-emerald-50/80">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                        <Receipt className="h-4 w-4 text-green-600" />
                                        Financial Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-gray-600 text-sm">Subtotal (VAT Ex)</span>
                                            <span className="font-semibold text-gray-900 text-sm">{formatCurrency(vatExAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-gray-600 text-sm">VAT (12%)</span>
                                            <span className="font-semibold text-gray-900 text-sm">{formatCurrency(vatAmount)}</span>
                                        </div>
                                    </div>
                                    <Separator className="bg-gray-300" />
                                    <div className="flex justify-between items-center py-2 bg-white/60 rounded-lg px-3 -mx-1">
                                        <span className="font-bold text-gray-900">Total Amount</span>
                                        <span className="text-xl font-bold text-green-600">{formatCurrency(purchaseOrder.po_amount)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Audit Trail */}
                            <Card className="shadow-sm border-gray-200/60">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Audit Trail
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-2">
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Created By</Label>
                                        <p className="font-semibold text-gray-900 mt-1 text-sm">{purchaseOrder.created_by?.name || 'System'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(purchaseOrder.created_at)}</p>
                                    </div>
                                    {purchaseOrder.updated_by && purchaseOrder.updated_at !== purchaseOrder.created_at && (
                                        <>
                                            <Separator />
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500">Last Updated By</Label>
                                                <p className="font-semibold text-gray-900 mt-1 text-sm">{purchaseOrder.updated_by?.name || 'System'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{formatDate(purchaseOrder.updated_at)}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
