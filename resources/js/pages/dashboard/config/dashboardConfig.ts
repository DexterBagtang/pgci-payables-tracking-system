/**
 * Dashboard Widget Configuration by Role
 *
 * Defines the order and organization of widgets for each user role.
 * Widgets are organized into rows with responsive grid layouts.
 */

export type WidgetType =
    | 'ap-aging'
    | 'upcoming-cashout'
    | 'pending-approvals'
    | 'invoice-pipeline'
    | 'po-utilization'
    | 'bottlenecks'
    | 'top-vendors'
    | 'project-spend'
    | 'compliance'
    | 'activity-feed';

export interface WidgetRow {
    /** Tailwind grid classes for this row */
    gridClass: string;
    /** Widget IDs in display order for this row */
    widgets: WidgetType[];
}

export interface RoleDashboardConfig {
    rows: WidgetRow[];
}

/**
 * Disbursement Role Configuration
 * Focus: Cash flow, payments, AP aging
 */
const disbursementConfig: RoleDashboardConfig = {
    rows: [
        {
            gridClass: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4',
            widgets: ['ap-aging', 'upcoming-cashout', 'pending-approvals', 'invoice-pipeline'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['po-utilization', 'bottlenecks'],
        },
        // {
        //     gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
        //     widgets: ['top-vendors', 'project-spend'],
        // },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['compliance', 'activity-feed'],
        },
    ],
};

/**
 * Payables Role Configuration
 * Focus: Invoice processing, approvals, vendor management
 */
const payablesConfig: RoleDashboardConfig = {
    rows: [
        {
            gridClass: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4',
            widgets: ['invoice-pipeline', 'pending-approvals', 'ap-aging', 'top-vendors'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['upcoming-cashout', 'bottlenecks'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['po-utilization', 'project-spend'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['compliance', 'activity-feed'],
        },
    ],
};

/**
 * Purchasing Role Configuration
 * Focus: Purchase orders, vendor relationships, project budgets
 */
const purchasingConfig: RoleDashboardConfig = {
    rows: [
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['top-vendors', 'project-spend'],
        },
        {
            gridClass: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4',
            widgets: ['invoice-pipeline', 'po-utilization', 'pending-approvals','bottlenecks'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['ap-aging', 'upcoming-cashout'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['compliance', 'activity-feed'],
        },
    ],
};

/**
 * Admin Role Configuration
 * Focus: System overview, bottlenecks, compliance
 */
const adminConfig: RoleDashboardConfig = {
    rows: [
        {
            gridClass: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4',
            widgets: ['bottlenecks', 'pending-approvals', 'compliance', 'invoice-pipeline'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['ap-aging', 'upcoming-cashout'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['po-utilization', 'project-spend'],
        },
        {
            gridClass: 'grid grid-cols-1 xl:grid-cols-2 gap-4',
            widgets: ['top-vendors', 'activity-feed'],
        },
    ],
};

/**
 * Main configuration map by role
 */
export const DASHBOARD_CONFIG: Record<string, RoleDashboardConfig> = {
    disbursement: disbursementConfig,
    payables: payablesConfig,
    purchasing: purchasingConfig,
    admin: adminConfig,
};

/**
 * Get dashboard configuration for a specific role
 * Falls back to disbursement config if role not found
 */
export function getDashboardConfig(role: string): RoleDashboardConfig {
    return DASHBOARD_CONFIG[role] || disbursementConfig;
}
