import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.js';
import CreatePOForm from '@/pages/purchase-orders/components/CreatePOForm.jsx';

export default function AddPurchaseOrderDialog({ open, onOpenChange, vendors, projects }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Add New Purchase Order</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to add a new purchase order
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto p-4 flex-1">
                    <CreatePOForm
                        vendors={vendors}
                        projects={projects}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
