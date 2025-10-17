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
            <DialogContent className="!max-w-5xl max-h-[90vh] flex flex-col gap-0 p-0">
                <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
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
                                    d="M12 4v16m8-8H4" 
                                />
                            </svg>
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                Add New Purchase Order
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-0.5">
                                Fill out the form below to add a new purchase order
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-6 flex-1 bg-gray-50/50">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <CreatePOForm
                            vendors={vendors}
                            projects={projects}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
