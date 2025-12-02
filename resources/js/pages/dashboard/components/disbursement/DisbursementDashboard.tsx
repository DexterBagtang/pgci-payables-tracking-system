import DisbursementActionableBanner from './DisbursementActionableBanner';
import CheckStatusPipeline from './CheckStatusPipeline';
import CheckPrintingQueue from './CheckPrintingQueue';
import PendingReleasesWidget from './PendingReleasesWidget';
import CheckSchedule from './CheckSchedule';
import CheckAgingChart from './CheckAgingChart';
import QuickDisbursementActions from './QuickDisbursementActions';
import DisbursementActivityTimeline from './DisbursementActivityTimeline';

export default function DisbursementDashboard() {
    return (
        <div className="space-y-4">
            {/* 1. Hero Section - Critical Actionable Items */}
            <DisbursementActionableBanner />

            {/* 2. Check Processing Pipeline */}
            <CheckStatusPipeline />

            {/* 3. Work Queues */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <CheckPrintingQueue />
                <PendingReleasesWidget />
            </div>

            {/* 4. Planning & Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Schedule & Aging */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <CheckSchedule />
                        <CheckAgingChart />
                    </div>
                </div>

                {/* Right Column - Quick Actions & Activity */}
                <div className="space-y-4">
                    <QuickDisbursementActions />
                    <DisbursementActivityTimeline />
                </div>
            </div>
        </div>
    );
}
