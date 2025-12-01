import DisbursementFinancialMetrics from './DisbursementFinancialMetrics';
import CheckPrintingQueue from './CheckPrintingQueue';
import PendingReleasesWidget from './PendingReleasesWidget';
import CheckSchedule from './CheckSchedule';
import CheckAgingChart from './CheckAgingChart';

export default function DisbursementDashboard() {
    return (
        <div className="space-y-6">
            {/* Financial Metrics - Top Row */}
            <DisbursementFinancialMetrics />

            {/* Main Content Grid - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Check Printing Queue */}
                <CheckPrintingQueue />

                {/* Pending Releases */}
                <PendingReleasesWidget />
            </div>

            {/* Second Row - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Check Schedule */}
                <CheckSchedule />

                {/* Check Aging Chart */}
                <CheckAgingChart />
            </div>
        </div>
    );
}
