import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
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
