import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button.js';
import {Badge} from '@/components/ui/badge.js';
import { formatDate } from 'date-fns';
import StatusBadge from '@/components/custom/StatusBadge.jsx';

export default function VendorPO({purchase_orders}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Purchase Orders</CardTitle>
                <CardDescription>
                    All purchase orders for this vendor
                </CardDescription>
            </CardHeader>

            <CardContent>
                {purchase_orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders</h3>
                        <p className="text-gray-500 mb-6">This vendor doesn't have any purchase orders yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {purchase_orders.map((po) => (
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
                                        <span className="text-gray-600">{formatDate(po.po_date,'PP')}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="font-medium">{(po.po_amount)}</span>
                                        <StatusBadge status={po.po_status} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
