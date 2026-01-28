import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: {
        read: string[];
        write: string[];
    };
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    module?: string; // Optional module name for permission checking
}

export interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
    message?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: FlashMessages;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export type UserRole = 'admin' | 'purchasing' | 'payables' | 'disbursement';

export type PurchaseOrderStatus = 'draft' | 'open' | 'closed' | 'cancelled';

export type InvoiceStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'pending_disbursement';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface CheckRequisition {
    id: number;
    requisition_number: string;
    requisition_status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processed' | 'paid';
    php_amount: number;
    request_date: string;
    payee_name: string;
    purpose: string;
    po_number: string | null;
    cer_number: string | null;
    si_number: string | null;
    generated_by: number;
    approved_at: string | null;
    processed_by: number | null;
    processed_at: string | null;
    generator?: User;
    processor?: User;
    invoices?: Invoice[];
    invoices_with_aging?: Invoice[];
    disbursements?: Disbursement[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface FileAttachment {
    id: number;
    fileable_type: string;
    fileable_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_category: string;
    file_purpose: string;
    file_size: number;
    disk: string;
    is_active: boolean;
    uploaded_by: number;
    version: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface ActivityLog {
    id: number;
    loggable_type: string;
    loggable_id: number;
    action: string;
    notes: string | null;
    user_id: number;
    user?: User;
    ip_address: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Remark {
    id: number;
    remarkable_type: string;
    remarkable_id: number;
    remark_text: string;
    user_id: number;
    user?: User;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface Vendor {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Project {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface PurchaseOrder {
    id: number;
    po_number: string;
    po_status: PurchaseOrderStatus;
    po_amount: number;
    vendor?: Vendor;
    project?: Project;
    vendor_id: number;
    project_id: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Invoice {
    id: number;
    si_number: string;
    si_received_at: string | null;
    invoice_date: string;
    due_date: string | null;
    net_amount: number;
    invoice_status: InvoiceStatus;
    currency: 'PHP' | 'USD';
    aging_days?: number | null;
    purchase_order?: PurchaseOrder;
    purchase_order_id: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Disbursement {
    id: number;
    check_voucher_number: string;
    date_check_scheduled: string | null;
    date_check_released_to_vendor: string | null;
    date_check_printing: string | null;
    remarks: string | null;
    created_by: number;
    creator?: User;
    created_at: string;
    updated_at: string;
    check_requisitions?: CheckRequisition[];
    files?: FileAttachment[];
    activity_logs?: ActivityLog[];
    remarks?: Remark[];
    // Computed properties (added by backend transform):
    total_amount?: number;
    check_requisition_count?: number;
    status?: 'pending' | 'released';
    [key: string]: unknown;
}

// Dashboard Types
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom' | 'all';

export type AlertPriority = 'urgent' | 'high' | 'medium' | 'low';
export type AlertCategory = 'invoice' | 'budget' | 'approval' | 'disbursement' | 'po';

export interface Alert {
    id: string;
    category: AlertCategory;
    priority: AlertPriority;
    title: string;
    message: string;
    count: number;
    action_url: string;
    created_at: string;
}

export interface TimeRangeState {
    range: TimeRange;
    start: string | null;
    end: string | null;
}

export interface DashboardFilterContext {
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    customDates: { start: Date; end: Date } | null;
    setCustomDates: (dates: { start: Date; end: Date } | null) => void;
}

// PO Dashboard Data Types
export interface POStatusData {
    status: PurchaseOrderStatus;
    count: number;
    total_amount: number;
    currency: 'PHP' | 'USD';
}

export interface POAgingBucket {
    bucket: string;
    count: number;
    total_amount: number;
}

export interface POFinancialMetrics {
    open_po_value_php: number;
    open_po_value_usd: number;
    pos_created_this_month: number;
    average_po_value: number;
    pos_closed_this_month: number;
    total_invoices: number;
    invoices_this_month: number;
    pending_invoices: number;
    total_invoice_amount: number;
}

export interface ProjectBudgetData {
    project_id: number;
    project_title: string;
    budget: number;
    committed: number;
    remaining: number;
    percentage: number;
    status: 'normal' | 'warning' | 'critical';
}

export interface VendorPerformanceData {
    vendor_id: number;
    vendor_name: string;
    active_pos: number;
    total_committed: number;
    total_invoiced: number;
    total_paid: number;
    outstanding_balance: number;
    invoice_count: number;
    currency: string;
}

// Invoice/Payables Dashboard Data Types
export interface InvoiceAgingBucket {
    bucket: string;
    count: number;
    total_amount: number;
}

export interface PayablesFinancialMetrics {
    outstanding_balance: number;
    pending_review_amount: number;
    approved_this_month: number;
    average_approval_time: number;
}

// Disbursement Dashboard Data Types
export interface DisbursementMetrics {
    checks_ready_to_print: number;
    checks_pending_release: number;
    released_this_month: number;
    total_pending_value: number;
}

export interface CheckAgingBucket {
    bucket: string;
    count: number;
    total_amount: number;
}

export interface VendorPaymentStatusData {
    payee_name: string;
    total_checks: number;
    released_checks: number;
    pending_checks: number;
    total_amount: number;
    last_payment_date: string | null;
}

export interface CheckScheduleData {
    week: string;
    total_amount: number;
    checks: {
        id: number;
        check_number: string | null;
        payee_name: string;
        php_amount: number;
        date_check_scheduled: string;
        payment_method: string;
        requisition_number: string;
    }[];
}

// Dashboard Props Types
export interface BaseDashboardProps {
    alerts: Alert[];
    timeRange: TimeRangeState;
}

export interface DashboardData {
    role: UserRole;
    alerts: Alert[];
    timeRange: TimeRangeState;
}

// Unified Dashboard Widget Data Types
export interface APAgingSummary {
    total_outstanding: number;
    total_overdue: number;
    aging_buckets: {
        '0_30': { count: number; amount: number };
        '31_60': { count: number; amount: number };
        '61_90': { count: number; amount: number };
        'over_90': { count: number; amount: number };
    };
}

export interface InvoicePipelineStatus {
    pending: number;
    received: number;
    in_progress: number;
    approved: number;
    pending_disbursement: number;
    rejected: number;
    paid: number;
    total: number;
}

export interface POUtilizationSnapshot {
    total_po_amount: number;
    total_invoiced: number;
    total_paid: number;
    invoiced_percentage: number;
    paid_percentage: number;
    remaining: number;
}

export interface UpcomingCashOut {
    due_7_days: { count: number; amount: number };
    due_15_days: { count: number; amount: number };
    due_30_days: { count: number; amount: number };
}

export interface TopVendorByOutstanding {
    vendor_name: string;
    outstanding_amount: number;
    invoice_count: number;
}

export interface ProcessBottleneckIndicators {
    avg_received_to_reviewed_days: number;
    avg_reviewed_to_approved_days: number;
    avg_approved_to_disbursed_days: number;
    total_in_pipeline: number;
}

export interface ProjectSpendItem {
    project_name: string;
    total_po: number;
    total_invoiced: number;
    total_paid: number;
    remaining: number;
}

export interface PendingApprovalsByRole {
    invoices_waiting_review: number;
    check_requisitions_pending: number;
    pos_pending_finalization: number;
    total: number;
}

export interface ComplianceMissingDocuments {
    overall_score: number;
    po_completeness: number;
    invoice_completeness: number;
    cr_completeness: number;
    total_pos: number;
    pos_with_files: number;
    total_invoices: number;
    invoices_with_files: number;
    total_crs: number;
    crs_with_files: number;
    pos_missing_attachments: Array<{ id: number; po_number: string }>;
    invoices_missing_si: Array<{ id: number; si_number: string }>;
    crs_missing_docs: Array<{ id: number; requisition_number: string }>;
}

export interface ActivityFeedItem {
    id: number;
    user: string;
    entity_type: string;
    entity_id: number;
    entity_identifier: string;
    action: string;
    notes: string | null;
    created_at: string;
    created_at_human: string;
}

export interface ActivityFeedResponse {
    data: ActivityFeedItem[];
    hasMore: boolean;
    currentPage: number;
}

export interface UserManual {
    slug: string;
    title: string;
    description: string;
    roles: string[];
    complexity: 'Beginner' | 'Intermediate' | 'Advanced';
    timeToComplete?: string;
    content?: string;
}
