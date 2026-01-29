/**
 * Get suggested help guides based on the current route
 */
export function getSuggestedGuides(pathname: string): string[] {
    const routeMap: Record<string, string[]> = {
        '/invoices': ['bulk-invoice-creation', 'invoice-approval-workflow'],
        '/invoices/create': ['bulk-invoice-creation'],
        '/invoices/bulk': ['bulk-invoice-creation'],
        '/check-requisitions': ['check-requisition-creation', 'invoice-approval-workflow'],
        '/check-requisitions/create': ['check-requisition-creation'],
        '/vendors': ['vendor-management'],
        '/vendors/create': ['vendor-management'],
        '/projects': ['project-management'],
        '/projects/create': ['project-management'],
        '/purchase-orders': ['vendor-management', 'project-management'],
    };

    // Find matching route
    for (const [route, guides] of Object.entries(routeMap)) {
        if (pathname.startsWith(route)) {
            return guides;
        }
    }

    // Default guides for any page
    return [];
}
