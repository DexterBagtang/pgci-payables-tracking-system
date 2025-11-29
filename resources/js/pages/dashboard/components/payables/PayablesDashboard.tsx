import PayablesFinancialMetrics from './PayablesFinancialMetrics';
import InvoiceReviewQueue from './InvoiceReviewQueue';
import CRApprovalWidget from './CRApprovalWidget';
import InvoiceAgingChart from './InvoiceAgingChart';
import PaymentSchedule from './PaymentSchedule';

export default function PayablesDashboard() {
    return (
        <div className="space-y-6">
            {/* Financial Metrics - Metric Cards */}
            <PayablesFinancialMetrics />

            {/* First Row: Invoice Review Queue + CR Approval */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InvoiceReviewQueue />
                <CRApprovalWidget />
            </div>

            {/* Second Row: Invoice Aging + Payment Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InvoiceAgingChart />
                <PaymentSchedule />
            </div>
        </div>
    );
}
