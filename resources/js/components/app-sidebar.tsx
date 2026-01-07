import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Building,
    Files,
    FileSignature,
    FolderKanban,
    LayoutGrid,
    Receipt,
    ScanSearch,
    Banknote
} from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/use-permissions';
import { useMemo } from 'react';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        // Dashboard is accessible to everyone
    },
    {
        title: 'Vendors',
        href: '/vendors',
        icon: Building,
        module: 'vendors',
    },
    {
        title: 'Projects',
        href: '/projects',
        icon: FolderKanban,
        module: 'projects',
    },
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
        icon: Files,
        module: 'purchase_orders',
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: Receipt,
        module: 'invoices',
    },
    {
        title:'Review',
        href: '/invoice/bulk-review',
        icon: ScanSearch,
        module: 'invoice_review',
    },
    {
        title:'Check Requisitions',
        href: '/check-requisitions',
        icon: FileSignature,
        module: 'check_requisitions',
    },
    {
        title: 'Disbursements',
        href: '/disbursements',
        icon: Banknote,
        module: 'disbursements',
    }

];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { canRead } = usePermissions();

    // Filter navigation items based on user permissions
    const filteredNavItems = useMemo(() => {
        return allNavItems.filter((item) => {
            // If no module specified, show the item (e.g., Dashboard)
            if (!item.module) return true;
            // Otherwise, check if user has read permission for the module
            return canRead(item.module);
        });
    }, [canRead]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
