import ActionableItemsBanner from './ActionableItemsBanner';
import POStatusOverview from './POStatusOverview';
import InvoiceStatusTracking from './InvoiceStatusTracking';
import QuickPOActions from './QuickPOActions';
import VendorMetrics from './VendorMetrics';
import ProjectMetrics from './ProjectMetrics';
import ActivityTimeline from './ActivityTimeline';

export default function PurchasingDashboard() {
    return (
        <div className="space-y-4">
            {/* 1. Hero Section - Critical Actionable Items */}
            <ActionableItemsBanner />

            {/* 2. Primary Status Tracking */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <POStatusOverview />
                <InvoiceStatusTracking />
            </div>

            {/* 3. Insights & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Vendor & Project Metrics */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <VendorMetrics />
                        <ProjectMetrics />
                    </div>
                </div>

                {/* Right Column - Quick Actions & Activity */}
                <div className="space-y-4">
                    <QuickPOActions />
                    <ActivityTimeline />
                </div>
            </div>
        </div>
    );
}
