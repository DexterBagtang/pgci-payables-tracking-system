import type { PurchasingDashboardData } from '@/types';
// Chart-based widgets (commented for future use)
// import POStatusDistribution from './POStatusDistribution';
// import POAgingWidget from './POAgingWidget';
// import POBudgetTracking from './POBudgetTracking';
// import CurrencyBreakdown from './CurrencyBreakdown';

// Active widgets
import POFinancialCommitments from './POFinancialCommitments';
import VendorPerformanceWidget from './VendorPerformanceWidget';
import POStatusSummary from './POStatusSummary';
import CurrencySummary from './CurrencySummary';
import RecentPOActivity from './RecentPOActivity';
import QuickPOActions from './QuickPOActions';

interface PurchasingDashboardProps extends PurchasingDashboardData {}

export default function PurchasingDashboard(props: PurchasingDashboardProps) {
    const {
        financialCommitments,
        vendorPerformance,
        poStatusSummary,
        currencySummary,
        recentPOActivity,
        // Old chart-based data (kept for future use)
        // poStatusDistribution,
        // poAging,
        // budgetTracking,
        // currencyBreakdown,
    } = props;

    return (
        <div className="space-y-4">
            {/* Financial Commitments - Metric Cards */}
            <POFinancialCommitments data={financialCommitments} />

            {/* Status & Currency Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <POStatusSummary data={poStatusSummary} />
                </div>
                <CurrencySummary data={currencySummary} />
            </div>

            {/* Recent Activity & Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <RecentPOActivity data={recentPOActivity} />
                </div>
                <QuickPOActions />
            </div>

            {/* Vendor Performance */}
            <VendorPerformanceWidget data={vendorPerformance} />

            {/* Chart-based widgets (commented for future use) */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <POStatusDistribution data={poStatusDistribution} />
                <POAgingWidget data={poAging} />
            </div> */}
            {/* <POBudgetTracking data={budgetTracking} /> */}
            {/* <CurrencyBreakdown data={currencyBreakdown} /> */}
        </div>
    );
}
