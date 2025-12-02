import PayablesActionableBanner from './PayablesActionableBanner';
import InvoiceStatusPipeline from './InvoiceStatusPipeline';
import InvoiceReviewQueue from './InvoiceReviewQueue';
import CRApprovalWidget from './CRApprovalWidget';
import InvoiceAgingChart from './InvoiceAgingChart';
import PaymentSchedule from './PaymentSchedule';
import QuickPayablesActions from './QuickPayablesActions';
import PayablesActivityTimeline from './PayablesActivityTimeline';

export default function PayablesDashboard() {
    return (
        <div className="space-y-4">
            {/* 1. Hero Section - Critical Actionable Items */}
            <PayablesActionableBanner />

            {/* 2. Invoice Processing Pipeline */}
            <InvoiceStatusPipeline />

            {/* 3. Work Queues */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <InvoiceReviewQueue />
                <CRApprovalWidget />
            </div>

            {/* 4. Planning & Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Aging & Payment Schedule */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <InvoiceAgingChart />
                        <PaymentSchedule />
                    </div>
                </div>

                {/* Right Column - Quick Actions & Activity */}
                <div className="space-y-4">
                    <QuickPayablesActions />
                    <PayablesActivityTimeline />
                </div>
            </div>
        </div>
    );
}
