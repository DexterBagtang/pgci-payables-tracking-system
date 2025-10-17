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
            <DialogContent className="!max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Edit Purchase Order - {purchaseOrder?.po_number}</DialogTitle>
                    <DialogDescription>
                        Update the purchase order details below
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto p-4 flex-1">
                    <EditPOForm
                        purchaseOrder={purchaseOrder}
                        vendors={vendors}
                        projects={projects}
                        onSuccess={() => onOpenChange(false)}
                        isDialog={true}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
