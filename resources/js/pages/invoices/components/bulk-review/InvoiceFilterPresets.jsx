import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Invoice Filter Presets Component
 * Provides quick-access filter presets for common review scenarios
 */
export default function InvoiceFilterPresets({
    currentFilters,
    onApplyPreset
}) {
    const presets = [
        {
            id: 'ready-to-approve',
            name: 'Ready to Approve',
            icon: CheckCircle2,
            description: 'Files received, ready for approval',
            filters: {
                status: 'received'
            },
            color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
        },
        {
            id: 'pending-files',
            name: 'Pending Files',
            icon: AlertTriangle,
            description: 'Waiting for physical files',
            filters: {
                status: 'pending'
            },
            color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100'
        },
        {
            id: 'under-review',
            name: 'Under Review',
            icon: Clock,
            description: 'Currently being reviewed',
            filters: {
                status: 'under_review'
            },
            color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
        },
        {
            id: 'rejected',
            name: 'Rejected',
            icon: XCircle,
            description: 'Previously rejected invoices',
            filters: {
                status: 'rejected'
            },
            color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
        }
    ];

    const isPresetActive = (presetFilters) => {
        return Object.entries(presetFilters).every(([key, value]) =>
            currentFilters[key] === value
        );
    };

    return (
        <div className="flex flex-wrap gap-1">
            <span className="text-[10px] font-semibold text-slate-600 self-center mr-1">
                Quick:
            </span>
            {presets.map((preset) => {
                const Icon = preset.icon;
                const isActive = isPresetActive(preset.filters);

                return (
                    <Button
                        key={preset.id}
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyPreset(preset.filters)}
                        className={`h-5 px-1.5 text-[10px] border ${preset.color} ${
                            isActive ? 'ring-1 ring-offset-0' : ''
                        }`}
                        title={preset.description}
                    >
                        <Icon className="h-2.5 w-2.5 mr-0.5" />
                        {preset.name}
                        {isActive && (
                            <Badge
                                variant="secondary"
                                className="ml-1 h-3 w-3 p-0 flex items-center justify-center rounded-full text-[8px]"
                            >
                                ✓
                            </Badge>
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
