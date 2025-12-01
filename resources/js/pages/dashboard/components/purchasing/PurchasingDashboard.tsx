// Active widgets
import POFinancialCommitments from './POFinancialCommitments';
import VendorPerformanceWidget from './VendorPerformanceWidget';
import RecentInvoiceActivity from './RecentInvoiceActivity';
import QuickPOActions from './QuickPOActions';

export default function PurchasingDashboard() {
    return (
        <div className="space-y-4">
            {/* Consolidated Financial Metrics */}
            <POFinancialCommitments />

            {/* Vendor Performance & Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <VendorPerformanceWidget />
                </div>
                <div className="space-y-4">
                    <QuickPOActions />
                    <RecentInvoiceActivity />
                </div>
            </div>
        </div>
    );
}
