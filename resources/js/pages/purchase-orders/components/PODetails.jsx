import { lazy, Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRemember, usePage } from '@inertiajs/react';
import { Loader, Info, DollarSign, Receipt, FileText, Clock } from 'lucide-react';

// Import custom hooks
import { usePOFinancials } from '../hooks/usePOFinancials';
import { usePOFormatters } from '../hooks/usePOFormatters';

// Import presentational components
import POHeader from './show/POHeader';
import POFinancialCards from './show/POFinancialCards';
import POInvoiceStatusCards from './show/POInvoiceStatusCards';
import POKeyInformation from './show/POKeyInformation';
import POOverviewTab from './show/POOverviewTab';
import POFinancialTab from './show/POFinancialTab';
import POInvoicesTab from './show/POInvoicesTab';

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
    const [tab, setTab] = useRemember('overview', 'po-detail-tab');
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const { user } = usePage().props.auth;

    // Destructure purchase order data
    const { files, activity_logs, invoices, remarks } = purchaseOrder;

    // Custom hooks for logic separation
    const financialMetrics = usePOFinancials(purchaseOrder, invoices);
    const { formatCurrency, formatDate, formatPercentage } = usePOFormatters();

    // Tab configuration - cleaner approach
    const tabs = [
        {
            value: 'overview',
            label: 'Overview',
            icon: Info,
            activeClasses: 'border-blue-500 bg-blue-50 shadow-sm',
            iconActiveClasses: 'text-blue-600',
            textActiveClasses: 'text-blue-700',
            indicatorClasses: 'bg-blue-500'
        },
        {
            value: 'financial',
            label: 'Financial',
            icon: DollarSign,
            activeClasses: 'border-green-500 bg-green-50 shadow-sm',
            iconActiveClasses: 'text-green-600',
            textActiveClasses: 'text-green-700',
            indicatorClasses: 'bg-green-500'
        },
        {
            value: 'invoices',
            label: `Invoices (${invoices?.length || 0})`,
            icon: Receipt,
            activeClasses: 'border-orange-500 bg-orange-50 shadow-sm',
            iconActiveClasses: 'text-orange-600',
            textActiveClasses: 'text-orange-700',
            indicatorClasses: 'bg-orange-500'
        },
        {
            value: 'attachments',
            label: `Attachments (${files?.length || 0})`,
            icon: FileText,
            activeClasses: 'border-purple-500 bg-purple-50 shadow-sm',
            iconActiveClasses: 'text-purple-600',
            textActiveClasses: 'text-purple-700',
            indicatorClasses: 'bg-purple-500'
        },
        {
            value: 'remarks',
            label: `Remarks (${remarks?.length || 0})`,
            icon: FileText,
            activeClasses: 'border-indigo-500 bg-indigo-50 shadow-sm',
            iconActiveClasses: 'text-indigo-600',
            textActiveClasses: 'text-indigo-700',
            indicatorClasses: 'bg-indigo-500'
        },
        {
            value: 'timeline',
            label: 'Activity Logs',
            icon: Clock,
            activeClasses: 'border-slate-500 bg-slate-50 shadow-sm',
            iconActiveClasses: 'text-slate-600',
            textActiveClasses: 'text-slate-700',
            indicatorClasses: 'bg-slate-500'
        },
    ];

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header Section */}
                    <POHeader
                        purchaseOrder={purchaseOrder}
                        user={user}
                        financialMetrics={financialMetrics}
                        formatDate={formatDate}
                        onCloseClick={() => setShowCloseDialog(true)}
                    />

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

                    {/* Key Information */}
                    <POKeyInformation
                        purchaseOrder={purchaseOrder}
                        formatDate={formatDate}
                    />

                    {/* Tabbed Content */}
                    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tabConfig) => {
                                const Icon = tabConfig.icon;
                                const isActive = tab === tabConfig.value;

                                return (
                                    <button
                                        key={tabConfig.value}
                                        onClick={() => setTab(tabConfig.value)}
                                        className={`
                                            group relative flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all duration-200
                                            ${isActive ? tabConfig.activeClasses : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
                                        `}
                                    >
                                        <Icon className={`h-4 w-4 transition-colors ${
                                            isActive ? tabConfig.iconActiveClasses : 'text-gray-500 group-hover:text-gray-700'
                                        }`} />
                                        <span className={`text-sm font-medium transition-colors ${
                                            isActive ? tabConfig.textActiveClasses : 'text-gray-700 group-hover:text-gray-900'
                                        }`}>
                                            {tabConfig.label}
                                        </span>
                                        {isActive && (
                                            <div className={`absolute -bottom-2 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full ${tabConfig.indicatorClasses}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <TabsContent value="overview" className="space-y-6">
                            <POOverviewTab
                                purchaseOrder={purchaseOrder}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                            />
                        </TabsContent>

                        <TabsContent value="financial" className="space-y-6">
                            <POFinancialTab
                                financialMetrics={financialMetrics}
                                currency={purchaseOrder.currency}
                                invoicesLength={invoices?.length || 0}
                                formatCurrency={formatCurrency}
                                formatPercentage={formatPercentage}
                                onViewInvoicesClick={() => setTab('invoices')}
                            />
                        </TabsContent>

                        <TabsContent value="invoices" className="space-y-4">
                            <POInvoicesTab
                                invoices={invoices}
                                currency={purchaseOrder.currency}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                            />
                        </TabsContent>

                        <TabsContent value="attachments" className="space-y-6">
                            <Suspense fallback={<Loader className="mx-auto h-6 w-6 animate-spin text-blue-600" />}>
                                <AttachmentViewer files={files || []} />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="remarks" className="space-y-6">
                            <Suspense fallback={<Loader className="mx-auto animate-spin" />}>
                                <Remarks
                                    remarks={remarks}
                                    remarkableType="PurchaseOrder"
                                    remarkableId={purchaseOrder.id}
                                />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value="timeline" className="space-y-6">
                            <Suspense fallback={<Loader className="mx-auto animate-spin" />}>
                                <ActivityTimeline
                                    activity_logs={activity_logs}
                                    title="Purchase Order Timeline"
                                    entityType="Purchase Order"
                                />
                            </Suspense>
                        </TabsContent>
                    </Tabs>
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
