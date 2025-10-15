import { Badge } from '@/components/ui/badge';
import {
    Clock,
    Receipt,
    CheckCircle2,
    XCircle,
    DollarSign,
    AlertCircle,
    FileText,
    Send,
    Loader2,
    Package,
    Truck,
    CheckCheck,
    Ban,
    PlayCircle,
    PauseCircle,
    Archive,
    Circle, Clock2, FolderOpen, FileCheck2, CircleX
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Centralized Status Badge Component
 * Flexible status display component that can be used across the entire application
 * Supports custom statuses, colors, icons, and sizes
 */

// Default status configurations
const DEFAULT_STATUS_CONFIGS = {
    // Invoice Statuses
    pending: {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
        label: 'Pending Review',
    },
    received: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Receipt,
        label: 'Received',
    },
    approved: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
        label: 'Approved',
    },
    rejected: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Rejected',
    },
    pending_disbursement: {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: DollarSign,
        label: 'Pending Disbursement',
    },

    // Payment Statuses
    paid: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
        label: 'Paid',
    },
    unpaid: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Unpaid',
    },
    partially_paid: {
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: 'Partially Paid',
    },
    overdue: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertCircle,
        label: 'Overdue',
    },

    // Processing Statuses
    processing: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Loader2,
        label: 'Processing',
        animate: true,
    },
    submitted: {
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Send,
        label: 'Submitted',
    },

    // General Statuses
    draft: {
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: FileText,
        label: 'Draft',
    },
    cancelled: {
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: Ban,
        label: 'Cancelled',
    },
    completed: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCheck,
        label: 'Completed',
    },

    // PO Statuses
    open: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: FileCheck2,
        label: 'Open',
    },
    closed: {
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: Archive,
        label: 'Closed',
    },
    partial: {
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: PauseCircle,
        label: 'Partial',
    },

    // Delivery/Shipping Statuses
    pending_delivery: {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Package,
        label: 'Pending Delivery',
    },
    in_transit: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Truck,
        label: 'In Transit',
    },
    delivered: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
        label: 'Delivered',
    },

    // Active/Inactive
    active: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
        label: 'Active',
    },
    inactive: {
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: CircleX,
        label: 'Inactive',
    },

    pending_approval: {
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock2,
        label: 'Pending Approval',
    },
};

/**
 * StatusBadge Component
 *
 * @param {string} status - The status value (e.g., 'pending', 'approved', 'rejected')
 * @param {boolean} showIcon - Whether to display an icon (default: true)
 * @param {string} customLabel - Custom label to override default status label
 * @param {string} customColor - Custom color classes to override default colors
 * @param {React.Component} customIcon - Custom icon component to override default icon
 * @param {string} size - Badge size: 'xs' | 'sm' | 'default' | 'lg' | 'xl'
 * @param {string} variant - Badge variant: 'default' | 'outline' | 'solid'
 * @param {boolean} uppercase - Whether to uppercase the label (default: false)
 * @param {boolean} animate - Whether to animate the icon (default: auto-detect for processing status)
 * @param {string} className - Additional CSS classes
 */
const StatusBadge = ({
                         status,
                         showIcon = true,
                         customLabel = null,
                         customColor = null,
                         customIcon = null,
                         size = 'default',
                         variant = 'default',
                         uppercase = false,
                         animate = null,
                         className = '',
                     }) => {
    // Normalize status (lowercase, replace spaces/hyphens with underscores)
    const normalizedStatus = status?.toString().toLowerCase().replace(/[\s-]/g, '_');

    // Get config or create a fallback
    const config = DEFAULT_STATUS_CONFIGS[normalizedStatus] || {
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: Circle,
        label: status || 'Unknown',
    };

    // Use custom icon or config icon
    const Icon = customIcon || config.icon;

    // Use custom color or config color
    const colorClasses = customColor || config.color;

    // Use custom label or config label
    const label = customLabel || config.label;

    // Determine if should animate (explicit animate prop or config animate)
    const shouldAnimate = animate !== null ? animate : config.animate;

    // Size configurations
    const sizeClasses = {
        xs: 'text-[10px] py-0.5 px-1.5 gap-0.5',
        sm: 'text-xs py-0.5 px-2 gap-1',
        default: 'text-xs py-1 px-2.5 gap-1',
        lg: 'text-sm py-1.5 px-3 gap-1.5',
        xl: 'text-base py-2 px-4 gap-2',
    };

    // Icon size configurations
    const iconSizes = {
        xs: 'h-2.5 w-2.5',
        sm: 'h-3 w-3',
        default: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
        xl: 'h-5 w-5',
    };

    return (
        <Badge
            className={cn(
                colorClasses,
                sizeClasses[size] || sizeClasses.default,
                'inline-flex items-center justify-center font-medium',
                variant === 'outline' && 'border bg-transparent',
                variant === 'solid' && 'border-0',
                uppercase && 'uppercase',
                className
            )}
        >
            {showIcon && Icon && (
                <Icon
                    className={cn(
                        iconSizes[size] || iconSizes.default,
                        shouldAnimate && 'animate-spin'
                    )}
                />
            )}
            <span>{label}</span>
        </Badge>
    );
};

/**
 * Helper function to get status configuration
 * Useful when you need just the config without rendering
 */
export const getStatusConfig = (status) => {
    const normalizedStatus = status?.toString().toLowerCase().replace(/[\s-]/g, '_');
    return DEFAULT_STATUS_CONFIGS[normalizedStatus] || {
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: Circle,
        label: status || 'Unknown',
    };
};

/**
 * Helper function to get status color class
 */
export const getStatusColor = (status) => {
    const config = getStatusConfig(status);
    return config.color;
};

/**
 * Aging Badge Component
 * For displaying how long an invoice/item has been pending
 */
export const AgingBadge = ({
                               days,
                               size = 'default',
                               showLabel = true,
                               className = ''
                           }) => {
    const getAgingConfig = (days) => {
        if (days <= 7) return {
            color: 'bg-green-50 text-green-700 border-green-200',
            label: 'New',
        };
        if (days <= 14) return {
            color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            label: 'Recent',
        };
        if (days <= 30) return {
            color: 'bg-orange-50 text-orange-700 border-orange-200',
            label: 'Aging',
        };
        return {
            color: 'bg-red-50 text-red-700 border-red-200',
            label: 'Critical',
        };
    };

    const config = getAgingConfig(days);

    const sizeClasses = {
        xs: 'text-[10px] py-0.5 px-1.5',
        sm: 'text-xs py-0.5 px-2',
        default: 'text-xs py-1 px-2.5',
        lg: 'text-sm py-1.5 px-3',
    };

    const iconSizes = {
        xs: 'h-2.5 w-2.5',
        sm: 'h-3 w-3',
        default: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                config.color,
                sizeClasses[size],
                'inline-flex items-center justify-center gap-1',
                className
            )}
        >
            <Clock className={iconSizes[size]} />
            <span>{days}d</span>
            {showLabel && <span className="hidden sm:inline">aging</span>}
        </Badge>
    );
};

/**
 * Overdue Badge Component
 */
export const OverdueBadge = ({
                                 daysOverdue,
                                 size = 'default',
                                 showLabel = true,
                                 className = ''
                             }) => {
    if (!daysOverdue || daysOverdue <= 0) return null;

    const sizeClasses = {
        xs: 'text-[10px] py-0.5 px-1.5',
        sm: 'text-xs py-0.5 px-2',
        default: 'text-xs py-1 px-2.5',
        lg: 'text-sm py-1.5 px-3',
    };

    const iconSizes = {
        xs: 'h-2.5 w-2.5',
        sm: 'h-3 w-3',
        default: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    return (
        <Badge
            variant="destructive"
            className={cn(
                sizeClasses[size],
                'inline-flex items-center justify-center gap-1',
                className
            )}
        >
            <AlertCircle className={iconSizes[size]} />
            <span>{daysOverdue}d</span>
            {showLabel && <span className="hidden sm:inline">overdue</span>}
        </Badge>
    );
};

/**
 * Status Group Component
 * For displaying multiple status badges together
 */
export const StatusGroup = ({
                                statuses = [],
                                size = 'default',
                                orientation = 'horizontal', // 'horizontal' | 'vertical'
                                className = ''
                            }) => {
    return (
        <div
            className={cn(
                'flex',
                orientation === 'horizontal' ? 'flex-row flex-wrap gap-2' : 'flex-col gap-2',
                className
            )}
        >
            {statuses.map((statusItem, index) => {
                if (typeof statusItem === 'string') {
                    return <StatusBadge key={index} status={statusItem} size={size} />;
                }
                return <StatusBadge key={index} {...statusItem} size={size} />;
            })}
        </div>
    );
};

export default StatusBadge;
