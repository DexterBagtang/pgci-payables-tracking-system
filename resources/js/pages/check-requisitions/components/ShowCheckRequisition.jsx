import { Head, router, useRemember } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActivityTimeline from '@/components/custom/ActivityTimeline';

// Import custom hooks
import { useCRFinancials } from '../hooks/useCRFinancials';
import { useCRFormatters } from '../hooks/useCRFormatters';

// Import presentational components
import CRHeader from './show/CRHeader';
import CRFinancialCards from './show/CRFinancialCards';
import CRAmountMismatchAlert from './show/CRAmountMismatchAlert';
import CRDetailsTab from './show/CRDetailsTab';
import InvoicesList from '@/components/custom/InvoicesList';
import CRDocumentsTab from './show/CRDocumentsTab';
import CRDocumentPreview from './show/CRDocumentPreview';

/**
 * Main Check Requisition Show Component
 * Follows "Thinking in React" principles:
 * 1. Component Composition - Breaks down into smaller, focused components
 * 2. Custom Hooks - Extracts complex logic (financials, formatters)
 * 3. Single Responsibility - Each sub-component has one job
 * 4. Data Flow - Props down, events up
 */
export default function ShowCheckRequisition({ checkRequisition, invoices, files, purchaseOrder }) {
    const [tab, setTab] = useRemember('details', 'check-details-tab');

    // Custom hooks for logic separation
    const financialMetrics = useCRFinancials(checkRequisition, invoices);
    const { formatCurrency, formatDate, formatDateTime } = useCRFormatters();

    // Helper to get correct amount based on currency
    const requisitionAmount = parseFloat(
        checkRequisition.currency === 'USD'
            ? checkRequisition.usd_amount
            : checkRequisition.php_amount
    );

    // Get all check requisition versions sorted by version (latest first)
    const checkReqVersions = files?.filter(f => f.file_purpose === 'check_requisition')
        .sort((a, b) => (b.version || 0) - (a.version || 0)) || [];

    // Latest version is the first one
    const mainPdfFile = checkReqVersions[0];

    // Navigation handlers
    const handleEdit = () => {
        router.visit(`/check-requisitions/${checkRequisition.id}/edit`);
    };

    const handleReview = () => {
        router.visit(`/check-requisitions/${checkRequisition.id}/review`);
    };

    // PDF handlers
    const handlePrintPdf = () => {
        if (mainPdfFile) {
            window.open(`/storage/${mainPdfFile.file_path}`, '_blank');
        }
    };

    const handleDownloadPdf = () => {
        if (mainPdfFile) {
            const link = document.createElement('a');
            link.href = `/storage/${mainPdfFile.file_path}`;
            link.download = mainPdfFile.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="py-6 print:py-2">
            <Head title={`Check Requisition - ${checkRequisition.requisition_number}`} />

            <div className="mx-auto sm:px-6 lg:px-8">
                {/* Header */}
                <CRHeader
                    checkRequisition={checkRequisition}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    mainPdfFile={mainPdfFile}
                    onEdit={handleEdit}
                    onReview={handleReview}
                />

                {/* Amount Mismatch Alert */}
                <CRAmountMismatchAlert
                    isMatching={financialMetrics.isBalanced}
                    requisitionAmount={requisitionAmount}
                    totalInvoicesAmount={financialMetrics.calculatedTotal}
                    variance={financialMetrics.calculatedTotal - requisitionAmount}
                    variancePercentage={(financialMetrics.calculatedTotal - requisitionAmount) / requisitionAmount * 100}
                    formatCurrency={formatCurrency}
                />

                {/* Financial Summary Cards */}
                <CRFinancialCards
                    requisitionAmount={requisitionAmount}
                    totalInvoicesAmount={financialMetrics.calculatedTotal}
                    formatCurrency={formatCurrency}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold">
                                    Check Requisition Details
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <Tabs value={tab} onValueChange={setTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 mb-6">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="invoices">Invoices ({invoices?.length || 0})</TabsTrigger>
                                        <TabsTrigger value="documents">Documents</TabsTrigger>
                                        <TabsTrigger value="audit">Activity Logs</TabsTrigger>
                                    </TabsList>

                                    {/* Details Tab */}
                                    <TabsContent value="details" className="space-y-6">
                                        <CRDetailsTab
                                            checkRequisition={checkRequisition}
                                            purchaseOrder={purchaseOrder}
                                            formatDate={formatDate}
                                            formatCurrency={formatCurrency}
                                        />
                                    </TabsContent>

                                    {/* Invoices Tab */}
                                    <TabsContent value="invoices" className="space-y-6">
                                        <InvoicesList
                                            invoices={(invoices || []).map(invoice => ({
                                                ...invoice,
                                                po_number: purchaseOrder?.po_number,
                                                purchase_order_id: purchaseOrder?.id,
                                                vendor_name: purchaseOrder?.vendor?.name,
                                                project_title: purchaseOrder?.project?.project_title
                                            }))}
                                            variant="table"
                                            hideColumns={['actions']}
                                            showToolbar
                                            showTotalRow
                                            totalRowLabel="Total"
                                            expectedTotal={checkRequisition.amount}
                                            compact
                                            formatCurrency={formatCurrency}
                                            formatDate={formatDate}
                                            emptyStateTitle="No invoices associated"
                                            emptyStateDescription="No invoices are associated with this check requisition"
                                        />
                                    </TabsContent>

                                    {/* Documents Tab */}
                                    <TabsContent value="documents" className="space-y-6">
                                        <CRDocumentsTab
                                            files={files}
                                            checkReqVersions={checkReqVersions}
                                            mainPdfFile={mainPdfFile}
                                            formatDateTime={formatDateTime}
                                        />
                                    </TabsContent>

                                    {/* Audit Trail Tab */}
                                    <TabsContent value="audit" className="space-y-6">
                                        <ActivityTimeline activity_logs={checkRequisition.activity_logs} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 print:hidden">
                        <CRDocumentPreview
                            mainPdfFile={mainPdfFile}
                            onDownload={handleDownloadPdf}
                            onPrint={handlePrintPdf}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
