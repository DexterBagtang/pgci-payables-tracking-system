import { lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, FileText, Wallet, Loader2 } from 'lucide-react';

// Eager load Purchasing Dashboard (default tab)
import PurchasingDashboard from '../purchasing/PurchasingDashboard';

// Lazy load other dashboards (only when tabs are clicked)
const PayablesDashboard = lazy(() => import('../payables/PayablesDashboard'));
const DisbursementDashboard = lazy(() => import('../disbursement/DisbursementDashboard'));

// Loading component for lazy-loaded dashboards
function DashboardLoader() {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Tabs defaultValue="purchasing" className="space-y-8">
            <TabsList className="inline-flex h-auto w-full items-center justify-start gap-2 rounded-lg bg-muted/50 p-1.5">
                <TabsTrigger
                    value="purchasing"
                    className="flex items-center gap-2.5 rounded-md px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                    <ShoppingCart className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>Purchasing</span>
                        <span className="text-xs font-normal text-muted-foreground">
                            Orders & Budget
                        </span>
                    </div>
                </TabsTrigger>
                <TabsTrigger
                    value="payables"
                    className="flex items-center gap-2.5 rounded-md px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                    <FileText className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>Payables</span>
                        <span className="text-xs font-normal text-muted-foreground">
                            Invoices & Checks
                        </span>
                    </div>
                </TabsTrigger>
                <TabsTrigger
                    value="disbursement"
                    className="flex items-center gap-2.5 rounded-md px-6 py-3 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                    <Wallet className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                        <span>Disbursement</span>
                        <span className="text-xs font-normal text-muted-foreground">
                            Releases & Tracking
                        </span>
                    </div>
                </TabsTrigger>
            </TabsList>

            {/* Purchasing Tab - Default, eagerly loaded */}
            <TabsContent value="purchasing" className="mt-0 space-y-4">
                <PurchasingDashboard />
            </TabsContent>

            {/* Payables Tab - Lazy loaded */}
            <TabsContent value="payables" className="mt-0 space-y-4">
                <Suspense fallback={<DashboardLoader />}>
                    <PayablesDashboard />
                </Suspense>
            </TabsContent>

            {/* Disbursement Tab - Lazy loaded */}
            <TabsContent value="disbursement" className="mt-0 space-y-4">
                <Suspense fallback={<DashboardLoader />}>
                    <DisbursementDashboard />
                </Suspense>
            </TabsContent>
        </Tabs>
    );
}
