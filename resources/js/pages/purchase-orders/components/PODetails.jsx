import { lazy, Suspense, useState } from 'react';
import { useRemember, usePage } from '@inertiajs/react';
import { Loader, Info, DollarSign, Receipt, FileText, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';

// Import custom hooks
import { usePOFinancials } from '../hooks/usePOFinancials';
import { usePOFormatters } from '../hooks/usePOFormatters';

// Import presentational components
import POHeader from './show/POHeader';
import POFinancialCards from './show/POFinancialCards';
import POInvoiceStatusCards from './show/POInvoiceStatusCards';
import POOverviewTab from './show/POOverviewTab';
import POFinancialTab from './show/POFinancialTab';
import InvoicesList from '@/components/custom/InvoicesList';

// Lazy load heavy components
const ActivityTimeline = lazy(() => import('@/components/custom/ActivityTimeline.jsx'));
const AttachmentViewer = lazy(() => import('@/pages/invoices/components/AttachmentViewer.jsx'));
const Remarks = lazy(() => import('@/components/custom/Remarks.jsx'));
const ClosePurchaseOrderDialog = lazy(() => import('@/pages/purchase-orders/components/ClosePurchaseOrderDialog.jsx'));

/**
 * Main Purchase Order Details Component
 * Follows "Thinking in React" principles:
 * 1. Component Composition - Breaks down into smaller, focused components
 * 2. Custom Hooks - Extracts complex logic (financials, formatters)
 * 3. Single Responsibility - Each sub-component has one job
 * 4. Data Flow - Props down, events up
 * 5. Lazy Loading - Heavy components loaded on demand
 */
export default function PODetails({ purchaseOrder, vendors, projects, backUrl }) {
    const { canWrite } = usePermissions();
    const [tab, setTab] = useRemember('overview', 'po-detail-tab');
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const { user } = usePage().props.auth;

    // Destructure purchase order data
    const { files, activity_logs, invoices, remarks } = purchaseOrder;

    // Custom hooks for logic separation
    const financialMetrics = usePOFinancials(purchaseOrder, invoices);
    const { formatCurrency, formatDate, formatPercentage } = usePOFormatters();

    // Tab configuration - compact style
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'financial', label: 'Financial', icon: DollarSign },
        { id: 'invoices', label: `Invoices (${invoices?.length || 0})`, icon: Receipt },
        { id: 'attachments', label: `Files (${files?.length || 0})`, icon: FileText },
        { id: 'remarks', label: `Notes (${remarks?.length || 0})`, icon: MessageSquare },
        { id: 'timeline', label: 'History', icon: Clock },
    ];

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                {/* Header Section - Full Width */}
                <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
                        <POHeader
                            purchaseOrder={purchaseOrder}
                            user={user}
                            financialMetrics={financialMetrics}
                            formatDate={formatDate}
                            formatPercentage={formatPercentage}
                            onCloseClick={() => setShowCloseDialog(true)}
                            canWrite={canWrite}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
                    {/* Compact Tabs - Moved to Top */}
                    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                        {tabs.map((item) => {
                            const Icon = item.icon;
                            const isActive = tab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setTab(item.id)}
                                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            {/* Financial Metrics Dashboard */}
                            <POFinancialCards
                                financialMetrics={financialMetrics}
                                currency={purchaseOrder.currency}
                                formatCurrency={formatCurrency}
                                formatPercentage={formatPercentage}
                            />

                            {/* Invoice Status Overview */}
                            <POInvoiceStatusCards
                                financialMetrics={financialMetrics}
                                totalInvoices={invoices?.length || 0}
                            />

                            {/* Overview Tab Content */}
                            <POOverviewTab
                                purchaseOrder={purchaseOrder}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                                invoices={invoices}
                            />
                        </div>
                    )}

                    {tab === 'financial' && (
                        <div className="space-y-6">
                            <POFinancialTab
                                financialMetrics={financialMetrics}
                                currency={purchaseOrder.currency}
                                invoicesLength={invoices?.length || 0}
                                formatCurrency={formatCurrency}
                                formatPercentage={formatPercentage}
                                onViewInvoicesClick={() => setTab('invoices')}
                            />
                        </div>
                    )}

                    {tab === 'invoices' && (
                        <div className="space-y-4">
                            <InvoicesList
                                invoices={(invoices || []).map(invoice => ({
                                    ...invoice,
                                    po_number: purchaseOrder.po_number,
                                    purchase_order_id: purchaseOrder.id,
                                    vendor_name: purchaseOrder.vendor?.name,
                                    project_title: purchaseOrder.project?.project_title
                                }))}
                                variant="table"
                                hideColumns={['poNumber', 'vendor', 'project']}
                                showToolbar={true}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                emptyStateTitle="No invoices linked"
                                emptyStateDescription="Invoices will appear once created and associated with this PO"
                                emptyStateAction={
                                    canWrite('invoices') ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.location.href = '/invoices/create'}
                                        >
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Create Invoice
                                        </Button>
                                    ) : null
                                }
                            />
                        </div>
                    )}

                    {tab === 'attachments' && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <Suspense fallback={<Loader className="mx-auto h-6 w-6 animate-spin text-blue-600" />}>
                                <AttachmentViewer files={files || []} />
                            </Suspense>
                        </div>
                    )}

                    {tab === 'remarks' && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <Suspense fallback={<Loader className="mx-auto animate-spin" />}>
                                <Remarks
                                    remarks={remarks}
                                    remarkableType="PurchaseOrder"
                                    remarkableId={purchaseOrder.id}
                                />
                            </Suspense>
                        </div>
                    )}

                    {tab === 'timeline' && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <Suspense fallback={<Loader className="mx-auto animate-spin" />}>
                                <ActivityTimeline
                                    activity_logs={activity_logs}
                                    title="Purchase Order Timeline"
                                    entityType="Purchase Order"
                                />
                            </Suspense>
                        </div>
                    )}
                </div>
            </div>

            {/* Close PO Dialog */}
            <Suspense fallback={null}>
                <ClosePurchaseOrderDialog
                    open={showCloseDialog}
                    onOpenChange={setShowCloseDialog}
                    purchaseOrder={purchaseOrder}
                />
            </Suspense>
        </>
    );
}
