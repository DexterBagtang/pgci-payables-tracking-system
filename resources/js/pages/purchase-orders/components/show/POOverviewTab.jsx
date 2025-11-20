import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/custom/StatusBadge';
import { Link } from '@inertiajs/react';
import { FileText, Info, Eye } from 'lucide-react';

/**
 * Overview Tab Content
 * Shows PO details and related information (vendor, project)
 * Principle: Tab-specific content in dedicated component
 */
export default function POOverviewTab({ purchaseOrder, formatDate, formatCurrency }) {
    return (
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
                            <div className="rounded bg-slate-50 p-3 text-sm text-slate-700">
                                {purchaseOrder.description}
                            </div>
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
                                    <span className="max-w-[200px] truncate text-right font-medium">
                                        {purchaseOrder.project.project_title}
                                    </span>
                                </div>
                                {purchaseOrder.project.cer_number && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">CER Number:</span>
                                        <span className="font-mono font-medium">{purchaseOrder.project.cer_number}</span>
                                    </div>
                                )}
                                {purchaseOrder.project.total_project_cost && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Total Project Cost:</span>
                                        <span className="font-medium">
                                            {formatCurrency(purchaseOrder.project.total_project_cost, purchaseOrder.currency)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
