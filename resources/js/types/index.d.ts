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

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
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
    check_requisitions?: unknown[];
    files?: unknown[];
    [key: string]: unknown;
}
