import type { DisbursementDashboardData } from '@/types';
import DisbursementFinancialMetrics from './DisbursementFinancialMetrics';
import CheckPrintingQueue from './CheckPrintingQueue';
import PendingReleasesWidget from './PendingReleasesWidget';
import CheckSchedule from './CheckSchedule';
import CheckAgingChart from './CheckAgingChart';

export default function DisbursementDashboard(props: DisbursementDashboardData) {
    const {
        disbursementMetrics,
        printingQueue,
        pendingReleases,
        checkSchedule,
        checkAging,
    } = props;

    return (
        <div className="space-y-6">
            {/* Financial Metrics - Top Row */}
            <DisbursementFinancialMetrics data={disbursementMetrics} />

            {/* Main Content Grid - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Check Printing Queue */}
                <CheckPrintingQueue data={printingQueue} />

                {/* Pending Releases */}
                <PendingReleasesWidget data={pendingReleases} />
            </div>

            {/* Second Row - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Check Schedule */}
                <CheckSchedule data={checkSchedule} />

                {/* Check Aging Chart */}
                <CheckAgingChart data={checkAging} />
            </div>
        </div>
    );
}
