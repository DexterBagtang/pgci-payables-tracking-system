import { User, Folder, Calendar, Info } from 'lucide-react';

/**
 * Key Information Section
 * Displays vendor, project, and timeline information
 * Principle: Presentational Component - Clean data display
 */
export default function POKeyInformation({ purchaseOrder, formatDate }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center text-lg font-semibold">
                <Info className="mr-2 h-5 w-5 text-indigo-600" />
                Key Information
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Vendor */}
                <div>
                    <div className="mb-2 flex items-center">
                        <User className="mr-2 h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-slate-700">Vendor</span>
                    </div>
                    <div className="truncate font-semibold text-slate-900">
                        {purchaseOrder.vendor?.name || 'No Vendor'}
                    </div>
                    <div className="truncate text-sm text-slate-600">
                        {purchaseOrder.vendor?.category || ''}
                    </div>
                </div>

                {/* Project */}
                <div>
                    <div className="mb-2 flex items-center">
                        <Folder className="mr-2 h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-slate-700">Project</span>
                    </div>
                    <div className="text-wrap font-semibold text-slate-900">
                        {purchaseOrder.project?.project_title || 'No Project'}
                    </div>
                    <div className="font-mono text-sm text-slate-600">
                        {purchaseOrder.project?.cer_number ? `CER: ${purchaseOrder.project.cer_number}` : 'N/A'}
                    </div>
                </div>

                {/* Timeline */}
                <div>
                    <div className="mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Timeline</span>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div>
                            PO Date: <span className="font-medium">{formatDate(purchaseOrder.po_date)}</span>
                        </div>
                        {purchaseOrder.expected_delivery_date && (
                            <div>
                                Expected: <span className="font-medium">{formatDate(purchaseOrder.expected_delivery_date)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
