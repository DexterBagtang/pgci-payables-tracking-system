import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.js';
import EditPOForm from '@/pages/purchase-orders/components/EditPOForm.jsx';

export default function EditPurchaseOrderDialog({ open, onOpenChange, purchaseOrder, vendors, projects }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl max-h-[90vh] flex flex-col gap-0 p-0">
                <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                            <svg 
                                className="w-5 h-5 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                                />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                Edit Purchase Order
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                                <span>Update the purchase order details below</span>
                                {purchaseOrder?.po_number && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs">
                                            {purchaseOrder.po_number}
                                        </span>
                                    </>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-6 flex-1 bg-gray-50/50">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <EditPOForm
                            purchaseOrder={purchaseOrder}
                            vendors={vendors}
                            projects={projects}
                            onSuccess={() => onOpenChange(false)}
                            isDialog={true}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
