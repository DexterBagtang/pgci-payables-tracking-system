import type { PayablesDashboardData } from '@/types';
import PayablesFinancialMetrics from './PayablesFinancialMetrics';
import InvoiceReviewQueue from './InvoiceReviewQueue';
import CRApprovalWidget from './CRApprovalWidget';
import InvoiceAgingChart from './InvoiceAgingChart';
import PaymentSchedule from './PaymentSchedule';

interface PayablesDashboardProps extends PayablesDashboardData {}

export default function PayablesDashboard(props: PayablesDashboardProps) {
    const {
        invoiceReviewQueue,
        crApprovalQueue,
        invoiceAging,
        paymentSchedule,
        invoiceStatusFunnel,
        financialMetrics,
        approvalVelocity,
    } = props;

    return (
        <div className="space-y-6">
            {/* Financial Metrics - Metric Cards */}
            <PayablesFinancialMetrics data={financialMetrics} />

            {/* First Row: Invoice Review Queue + CR Approval */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InvoiceReviewQueue data={invoiceReviewQueue} />
                <CRApprovalWidget data={crApprovalQueue} />
            </div>

            {/* Second Row: Invoice Aging + Payment Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InvoiceAgingChart data={invoiceAging} />
                <PaymentSchedule data={paymentSchedule} />
            </div>

            {/* Additional widgets can be added here */}
            {/* <InvoiceStatusFunnel data={invoiceStatusFunnel} /> */}
            {/* <ApprovalVelocity data={approvalVelocity} /> */}
        </div>
    );
}
