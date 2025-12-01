import { Separator } from '@/components/ui/separator';

// Import all role-specific dashboards
import PurchasingDashboard from '../purchasing/PurchasingDashboard';
import PayablesDashboard from '../payables/PayablesDashboard';
import DisbursementDashboard from '../disbursement/DisbursementDashboard';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Purchasing Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Purchasing Overview</h2>
                    <p className="text-sm text-muted-foreground">
                        Purchase orders, budget tracking, and vendor performance
                    </p>
                </div>
                <PurchasingDashboard />
            </section>

            <Separator className="my-8" />

            {/* Payables Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Payables Overview</h2>
                    <p className="text-sm text-muted-foreground">
                        Invoice review queue, check requisitions, and payment schedule
                    </p>
                </div>
                <PayablesDashboard />
            </section>

            <Separator className="my-8" />

            {/* Disbursement Section */}
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Disbursement Overview</h2>
                    <p className="text-sm text-muted-foreground">
                        Check printing, releases, and disbursement tracking
                    </p>
                </div>
                <DisbursementDashboard />
            </section>
        </div>
    );
}
