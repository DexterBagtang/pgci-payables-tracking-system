import { type BreadcrumbItem } from '@/types';

interface PurchaseOrder {
    id: number;
    po_number?: string;
    project?: {
        id: number;
        project_title?: string;
    };
    vendor?: {
        id: number;
        name?: string;
    };
}

interface Invoice {
    id: number;
    si_number?: string;
    purchaseOrder?: PurchaseOrder;
}

interface Project {
    id: number;
    project_title?: string;
}

interface Vendor {
    id: number;
    name?: string;
}

/**
 * Parse referrer URL to extract context information
 */
function parseReferrer(backUrl: string): {
    type: 'projects' | 'vendors' | 'purchase-orders' | 'invoices' | 'unknown';
    id?: number;
} {
    if (!backUrl) return { type: 'unknown' };

    // Extract path from full URL
    const url = new URL(backUrl, window.location.origin);
    const path = url.pathname;

    // Match patterns like /projects/123, /vendors/456, etc.
    const projectMatch = path.match(/^\/projects\/(\d+)/);
    if (projectMatch) {
        return { type: 'projects', id: parseInt(projectMatch[1]) };
    }

    const vendorMatch = path.match(/^\/vendors\/(\d+)/);
    if (vendorMatch) {
        return { type: 'vendors', id: parseInt(vendorMatch[1]) };
    }

    const poMatch = path.match(/^\/purchase-orders\/(\d+)/);
    if (poMatch) {
        return { type: 'purchase-orders', id: parseInt(poMatch[1]) };
    }

    const invoiceMatch = path.match(/^\/invoices\/(\d+)/);
    if (invoiceMatch) {
        return { type: 'invoices', id: parseInt(invoiceMatch[1]) };
    }

    // Check for list pages
    if (path.startsWith('/projects')) return { type: 'projects' };
    if (path.startsWith('/vendors')) return { type: 'vendors' };
    if (path.startsWith('/purchase-orders')) return { type: 'purchase-orders' };
    if (path.startsWith('/invoices')) return { type: 'invoices' };

    return { type: 'unknown' };
}

/**
 * Build breadcrumbs for Purchase Order pages based on referrer
 */
export function buildPurchaseOrderBreadcrumbs(
    purchaseOrder: PurchaseOrder,
    backUrl: string,
    currentPage: 'show' | 'edit' = 'show'
): BreadcrumbItem[] {
    const referrer = parseReferrer(backUrl);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Determine the navigation path based on referrer
    if (referrer.type === 'projects' && purchaseOrder.project) {
        // Came from projects - show project hierarchy
        breadcrumbs.push({
            title: 'Projects',
            href: '/projects',
        });
        breadcrumbs.push({
            title: purchaseOrder.project.project_title || 'Project',
            href: `/projects/${purchaseOrder.project.id}`,
        });
        breadcrumbs.push({
            title: 'Purchase Orders',
            href: `/projects/${purchaseOrder.project.id}#purchase-orders`,
        });
        breadcrumbs.push({
            title: purchaseOrder.po_number || 'PO',
            href: `/purchase-orders/${purchaseOrder.id}`,
        });
    } else if (referrer.type === 'vendors' && purchaseOrder.vendor) {
        // Came from vendors - show vendor hierarchy
        breadcrumbs.push({
            title: 'Vendors',
            href: '/vendors',
        });
        breadcrumbs.push({
            title: purchaseOrder.vendor.name || 'Vendor',
            href: `/vendors/${purchaseOrder.vendor.id}`,
        });
        breadcrumbs.push({
            title: 'Purchase Orders',
            href: `/vendors/${purchaseOrder.vendor.id}#purchase-orders`,
        });
        breadcrumbs.push({
            title: purchaseOrder.po_number || 'PO',
            href: `/purchase-orders/${purchaseOrder.id}`,
        });
    } else {
        // Default: came from PO list or unknown
        breadcrumbs.push({
            title: 'Purchase Orders',
            href: '/purchase-orders',
        });
        breadcrumbs.push({
            title: purchaseOrder.po_number || 'PO',
            href: `/purchase-orders/${purchaseOrder.id}`,
        });
    }

    // Add Edit breadcrumb if on edit page
    if (currentPage === 'edit') {
        breadcrumbs.push({
            title: 'Edit',
            href: '',
        });
    }

    return breadcrumbs;
}

/**
 * Build breadcrumbs for Invoice pages based on referrer
 */
export function buildInvoiceBreadcrumbs(
    invoice: Invoice,
    backUrl: string,
    currentPage: 'show' | 'edit' = 'show'
): BreadcrumbItem[] {
    const referrer = parseReferrer(backUrl);
    const breadcrumbs: BreadcrumbItem[] = [];
    const po = invoice.purchaseOrder;

    // Determine the navigation path based on referrer
    if (referrer.type === 'projects' && po?.project) {
        // Came from projects - show project → PO → invoice hierarchy
        breadcrumbs.push({
            title: 'Projects',
            href: '/projects',
        });
        breadcrumbs.push({
            title: po.project.project_title || 'Project',
            href: `/projects/${po.project.id}`,
        });
        breadcrumbs.push({
            title: 'Purchase Orders',
            href: `/projects/${po.project.id}#purchase-orders`,
        });
        breadcrumbs.push({
            title: po.po_number || 'PO',
            href: `/purchase-orders/${po.id}`,
        });
        breadcrumbs.push({
            title: 'Invoices',
            href: `/purchase-orders/${po.id}#invoices`,
        });
        breadcrumbs.push({
            title: invoice.si_number || 'Invoice',
            href: `/invoices/${invoice.id}`,
        });
    } else if (referrer.type === 'vendors' && po?.vendor) {
        // Came from vendors - show vendor → PO → invoice hierarchy
        breadcrumbs.push({
            title: 'Vendors',
            href: '/vendors',
        });
        breadcrumbs.push({
            title: po.vendor.name || 'Vendor',
            href: `/vendors/${po.vendor.id}`,
        });
        breadcrumbs.push({
            title: 'Purchase Orders',
            href: `/vendors/${po.vendor.id}#purchase-orders`,
        });
        breadcrumbs.push({
            title: po.po_number || 'PO',
            href: `/purchase-orders/${po.id}`,
        });
        breadcrumbs.push({
            title: 'Invoices',
            href: `/purchase-orders/${po.id}#invoices`,
        });
        breadcrumbs.push({
            title: invoice.si_number || 'Invoice',
            href: `/invoices/${invoice.id}`,
        });
    } else if (referrer.type === 'purchase-orders' && po) {
        // Came from PO - show PO → invoice hierarchy
        breadcrumbs.push({
            title: 'Purchase Orders',
            href: '/purchase-orders',
        });
        breadcrumbs.push({
            title: po.po_number || 'PO',
            href: `/purchase-orders/${po.id}`,
        });
        breadcrumbs.push({
            title: 'Invoices',
            href: `/purchase-orders/${po.id}#invoices`,
        });
        breadcrumbs.push({
            title: invoice.si_number || 'Invoice',
            href: `/invoices/${invoice.id}`,
        });
    } else {
        // Default: came from invoice list or unknown
        breadcrumbs.push({
            title: 'Invoices',
            href: '/invoices',
        });
        breadcrumbs.push({
            title: invoice.si_number || 'Invoice',
            href: `/invoices/${invoice.id}`,
        });
    }

    // Add Edit breadcrumb if on edit page
    if (currentPage === 'edit') {
        breadcrumbs.push({
            title: 'Edit',
            href: '',
        });
    }

    return breadcrumbs;
}
