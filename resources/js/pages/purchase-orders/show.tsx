import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { buildPurchaseOrderBreadcrumbs } from '@/lib/breadcrumbs';
import PODetails from '@/pages/purchase-orders/components/PODetails';
import PODetailsVariationC from '@/pages/purchase-orders/components/variations/PODetailsVariationC';
import { Palette } from 'lucide-react';

interface ShowPageProps {
    purchaseOrder: any;
    vendors: unknown[];
    projects: unknown[];
    backUrl: string;
}

type VariationType = 'current' | 'compact';

export default function ShowPurchaseOrderPage({ purchaseOrder, vendors, projects, backUrl }: ShowPageProps) {
    // Build breadcrumbs based on referrer
    const breadcrumbs: BreadcrumbItem[] = buildPurchaseOrderBreadcrumbs(
        purchaseOrder,
        backUrl,
        'show'
    );

    // Variation selector state
    const [variation, setVariation] = useState<VariationType>('current');

    const variations = [
        { value: 'current' as const, label: 'Current', description: 'Original design' },
        { value: 'compact' as const, label: 'Compact Grid', description: 'Xero-inspired - modern & efficient' },
    ];

    const renderVariation = () => {
        switch (variation) {
            case 'compact':
                return <PODetailsVariationC purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} backUrl={backUrl} />;
            default:
                return <PODetails purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} backUrl={backUrl} />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Purchase Order ${purchaseOrder.po_number || ''}`} />

            {/* Variation Selector - Remove after choosing */}
            <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Palette className="h-4 w-4" />
                    <span>Design Variations</span>
                </div>
                <div className="flex flex-col gap-2">
                    {variations.map((v) => (
                        <button
                            key={v.value}
                            onClick={() => setVariation(v.value)}
                            className={`rounded px-3 py-2 text-left text-sm transition-colors ${
                                variation === v.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            <div className="font-medium">{v.label}</div>
                            <div className="text-xs opacity-80">{v.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {renderVariation()}
        </AppLayout>
    );
}
