import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Building2, Calendar, DollarSign, Clock, Package, FileCheck, Download, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/components/custom/helpers.jsx';
import { formatDate } from 'date-fns';

const InvoiceReviewPanel = ({
                                currentInvoice,currentInvoiceIndex,invoices,
    handleNavigate,getStatusBadge,
                            }) => {

    if (!currentInvoice) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-50">
                <div className="text-center text-slate-400">
                    <Eye className="mx-auto mb-3 h-12 w-12 opacity-50" />
                    <p className="text-sm font-medium">Select an invoice to review</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-white">
            {/* Header with Navigation */}
            <div className="border-b bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Invoice Review</h2>
                        <p className="text-sm text-slate-500">Verify all details before approval</p>
                    </div>
                    <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              Invoice {currentInvoiceIndex + 1} of {invoices.data.length}
            </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleNavigate('prev')}
                                disabled={currentInvoiceIndex === 0}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleNavigate('next')}
                                disabled={currentInvoiceIndex === invoices.data.length - 1}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Single Scrollable Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="h-full px-6 py-6">

                    {/* Critical Info Header */}
                    <div className="mb-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">Invoice Number</div>
                                <div className="text-3xl font-bold text-slate-900">{currentInvoice.si_number}</div>
                            </div>
                            {getStatusBadge(currentInvoice.invoice_status)}
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-blue-600">Invoice Amount</div>
                                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(currentInvoice.invoice_amount)}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-blue-600">Invoice Date</div>
                                    <div className="text-lg font-semibold text-slate-900">{formatDate(currentInvoice.si_date)}</div>
                                </div>
                            </div>

                            {currentInvoice.due_date && (
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-blue-600">Due Date</div>
                                        <div className="text-lg font-semibold text-slate-900">{formatDate(currentInvoice.due_date)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Purchase Order Section */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-600" />
                                <h3 className="text-base font-semibold text-slate-900">Purchase Order Details</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">PO Number</div>
                                    <div className="font-mono text-lg font-bold text-slate-900">{currentInvoice.purchase_order?.po_number}</div>
                                </div>
                                <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">PO Amount</div>
                                    <div className="text-lg font-bold text-slate-900">{formatCurrency(currentInvoice.purchase_order?.po_amount || 0)}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <Building2 className="h-4 w-4" />
                                        Vendor
                                    </div>
                                    <div className="text-base font-semibold text-slate-900">{currentInvoice.purchase_order?.vendor?.name}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Project</div>
                                    <div className="text-base font-medium text-slate-900">{currentInvoice.purchase_order?.project?.project_title}</div>
                                    {currentInvoice.purchase_order?.project?.cer_number && (
                                        <div className="mt-1 text-sm text-slate-600">CER: {currentInvoice.purchase_order?.project?.cer_number}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Attached Files Section */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-slate-600" />
                                <h3 className="text-base font-semibold text-slate-900">Attached Files</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            {currentInvoice.files && currentInvoice.files.length > 0 ? (
                                <div className="grid gap-3">
                                    {currentInvoice.files.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-blue-100 p-2">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{file.file_name}</div>
                                                    <div className="text-sm text-slate-600">{(file.file_size / 1024).toFixed(2)} KB</div>
                                                </div>
                                            </div>
                                            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50">
                                                <Download className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                                    <p className="text-sm font-medium text-slate-600">No files attached</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Review Notes Section */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                            <h3 className="text-base font-semibold text-slate-900">Review Notes</h3>
                        </div>
                        <div className="p-6">
              <textarea
                  placeholder="Add your review notes here... (e.g., verification status, discrepancies found, action items)"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default InvoiceReviewPanel;
