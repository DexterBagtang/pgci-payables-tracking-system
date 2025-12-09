import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    FileText,
    Search,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    Filter,
    Receipt
} from 'lucide-react';
import StatusBadge from '@/components/custom/StatusBadge';

/**
 * Centralized Invoices List Component
 *
 * A flexible, reusable component for displaying invoices across different contexts
 * (vendors, purchase orders, projects, check requisitions)
 *
 * @param {Array} invoices - Array of invoice objects
 * @param {string} variant - Display variant: 'table' | 'compact' | 'cards'
 * @param {Array} hideColumns - Columns to hide based on context
 * @param {boolean} showSummaryCards - Show summary statistics cards
 * @param {boolean} showToolbar - Show search/filter/sort controls
 * @param {boolean} showTotalRow - Show total row at bottom
 * @param {string} totalRowLabel - Label for total row
 * @param {number} expectedTotal - Expected total for matching validation (CR use case)
 * @param {boolean} enableOverdueHighlight - Highlight overdue invoices
 * @param {boolean} compact - Use tighter spacing
 * @param {function} formatCurrency - Custom currency formatter
 * @param {function} formatDate - Custom date formatter
 * @param {string} emptyStateTitle - Custom empty state title
 * @param {string} emptyStateDescription - Custom empty state description
 * @param {ReactNode} emptyStateAction - Custom empty state action button
 */
export default function InvoicesList({
    invoices = [],
    variant = 'table',
    hideColumns = [],
    showSummaryCards = false,
    showToolbar = true,
    showTotalRow = false,
    totalRowLabel = 'Total',
    expectedTotal = null,
    enableOverdueHighlight = true,
    compact = false,
    formatCurrency: customFormatCurrency = null,
    formatDate: customFormatDate = null,
    emptyStateTitle = 'No invoices found',
    emptyStateDescription = 'Invoices will appear here once they are created',
    emptyStateAction = null
}) {
    console.log('🎯 NEW InvoicesList Component Loaded!', { variant, invoicesCount: invoices.length });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');

    // Default formatters
    const formatCurrency = customFormatCurrency || ((amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    });

    const formatDate = customFormatDate || ((dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    });

    // Check if invoice is overdue
    const isOverdue = (invoice) => {
        return enableOverdueHighlight &&
            invoice.due_date &&
            new Date(invoice.due_date) < new Date() &&
            invoice.invoice_status !== 'paid';
    };

    // Filter and sort logic
    const processedInvoices = useMemo(() => {
        let filtered = [...invoices];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(invoice => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    invoice.si_number?.toLowerCase().includes(searchLower) ||
                    invoice.po_number?.toLowerCase().includes(searchLower) ||
                    invoice.vendor_name?.toLowerCase().includes(searchLower) ||
                    invoice.project_title?.toLowerCase().includes(searchLower)
                );
            });
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(inv => inv.invoice_status === statusFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date_desc':
                    return new Date(b.si_date) - new Date(a.si_date);
                case 'date_asc':
                    return new Date(a.si_date) - new Date(b.si_date);
                case 'amount_desc':
                    return (b.net_amount || b.invoice_amount) - (a.net_amount || a.invoice_amount);
                case 'amount_asc':
                    return (a.net_amount || a.invoice_amount) - (b.net_amount || b.invoice_amount);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [invoices, searchTerm, statusFilter, sortBy]);

    // Calculate summary statistics
    const stats = useMemo(() => {
        const total = invoices.length;
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.net_amount || inv.invoice_amount || 0), 0);
        const paid = invoices.filter(inv => inv.invoice_status === 'paid');
        const paidAmount = paid.reduce((sum, inv) => sum + (inv.net_amount || inv.invoice_amount || 0), 0);
        const unpaid = invoices.filter(inv => inv.invoice_status !== 'paid');
        const unpaidAmount = unpaid.reduce((sum, inv) => sum + (inv.net_amount || inv.invoice_amount || 0), 0);
        const overdue = invoices.filter(inv => isOverdue(inv)).length;

        return {
            total,
            totalAmount,
            paidCount: paid.length,
            paidAmount,
            unpaidCount: unpaid.length,
            unpaidAmount,
            overdueCount: overdue
        };
    }, [invoices]);

    // Check if column should be visible
    const isColumnVisible = (columnName) => !hideColumns.includes(columnName);

    // Render summary cards
    const renderSummaryCards = () => (
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${compact ? 'mb-4' : 'mb-6'}`}>
            <Card>
                <CardContent className={compact ? 'pt-4' : 'pt-6'}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Invoices</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className={compact ? 'pt-4' : 'pt-6'}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold">{formatCurrency(stats.totalAmount)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className={compact ? 'pt-4' : 'pt-6'}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Paid</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatCurrency(stats.paidAmount)}
                            </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className={compact ? 'pt-4' : 'pt-6'}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                {stats.overdueCount > 0 ? 'Overdue' : 'Pending'}
                            </p>
                            <p className={`text-lg font-bold ${stats.overdueCount > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                {formatCurrency(stats.unpaidAmount)}
                            </p>
                        </div>
                        {stats.overdueCount > 0 ? (
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        ) : (
                            <Clock className="h-8 w-8 text-orange-600" />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Render toolbar
    const renderToolbar = () => (
        <div className={`flex flex-col md:flex-row gap-4 ${compact ? 'mb-4' : 'mb-6'}`}>
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by SI, PO, vendor, or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_disbursement">Pending Disbursement</SelectItem>
                </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date_desc">Date (Newest)</SelectItem>
                    <SelectItem value="date_asc">Date (Oldest)</SelectItem>
                    <SelectItem value="amount_desc">Amount (High)</SelectItem>
                    <SelectItem value="amount_asc">Amount (Low)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    // Render empty state
    const renderEmptyState = () => (
        <div className="text-center py-12 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <div className="mb-2 text-lg font-medium">{emptyStateTitle}</div>
            <p className="mb-4 text-sm text-gray-400">{emptyStateDescription}</p>
            {emptyStateAction}
        </div>
    );

    // Render table variant
    const renderTableVariant = () => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SI Number</TableHead>
                        {isColumnVisible('poNumber') && <TableHead>PO Number</TableHead>}
                        {isColumnVisible('vendor') && <TableHead>Vendor</TableHead>}
                        {isColumnVisible('project') && <TableHead>Project</TableHead>}
                        <TableHead>SI Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        {isColumnVisible('actions') && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {processedInvoices.length > 0 ? (
                        <>
                            {processedInvoices.map((invoice) => {
                                const overdueFlag = isOverdue(invoice);
                                return (
                                    <TableRow
                                        key={invoice.id}
                                        className={overdueFlag ? 'bg-red-50/50' : ''}
                                    >
                                        <TableCell className="font-medium">
                                            {invoice.si_number}
                                        </TableCell>
                                        {isColumnVisible('poNumber') && (
                                            <TableCell>
                                                {invoice.purchase_order_id ? (
                                                    <Link
                                                        href={`/purchase-orders/${invoice.purchase_order_id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {invoice.po_number}
                                                    </Link>
                                                ) : (
                                                    invoice.po_number || 'N/A'
                                                )}
                                            </TableCell>
                                        )}
                                        {isColumnVisible('vendor') && (
                                            <TableCell className="max-w-xs truncate">
                                                {invoice.vendor_name || 'N/A'}
                                            </TableCell>
                                        )}
                                        {isColumnVisible('project') && (
                                            <TableCell className="max-w-xs truncate">
                                                {invoice.project_title || 'N/A'}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {formatDate(invoice.si_date)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {overdueFlag && (
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                )}
                                                {formatDate(invoice.due_date)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(invoice.net_amount || invoice.invoice_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={invoice.invoice_status} size="sm" />
                                        </TableCell>
                                        {isColumnVisible('actions') && (
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={`/invoices/${invoice.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                            {showTotalRow && (
                                <TableRow className="bg-muted/30 font-semibold">
                                    <TableCell colSpan={
                                        7 - hideColumns.length - (isColumnVisible('actions') ? 0 : 1)
                                    } className="text-right">
                                        {totalRowLabel}:
                                    </TableCell>
                                    <TableCell className="text-right text-blue-600">
                                        {formatCurrency(
                                            processedInvoices.reduce(
                                                (sum, inv) => sum + (inv.net_amount || inv.invoice_amount || 0),
                                                0
                                            )
                                        )}
                                    </TableCell>
                                    {expectedTotal !== null && (
                                        <TableCell>
                                            {Math.abs(
                                                processedInvoices.reduce(
                                                    (sum, inv) => sum + (inv.net_amount || inv.invoice_amount || 0),
                                                    0
                                                ) - expectedTotal
                                            ) < 0.01 ? (
                                                <Badge variant="outline" className="text-xs bg-green-50 border-green-300">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Matched
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs bg-red-50 border-red-300">
                                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                                    Mismatch
                                                </Badge>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8 - hideColumns.length} className="text-center py-8">
                                {renderEmptyState()}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    // Render compact variant (for PO tabs)
    const renderCompactVariant = () => {
        if (processedInvoices.length === 0) {
            return renderEmptyState();
        }

        return (
            <div className="space-y-3">
                {processedInvoices.map((invoice) => {
                    const overdueFlag = isOverdue(invoice);
                    return (
                        <div
                            key={invoice.id}
                            className={`rounded-md border border-slate-200 p-3 transition-colors hover:bg-slate-50 ${
                                overdueFlag ? 'bg-red-50/50 border-red-200' : ''
                            }`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="font-medium text-slate-900">
                                        SI #{invoice.si_number}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {formatDate(invoice.si_date)}
                                    </div>
                                    {overdueFlag && (
                                        <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                            Overdue
                                        </Badge>
                                    )}
                                </div>
                                <StatusBadge status={invoice.invoice_status} size="sm" />
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-600">
                                <div className="flex gap-4">
                                    <span>
                                        Amount: <strong className="text-slate-900">
                                            {formatCurrency(invoice.invoice_amount)}
                                        </strong>
                                    </span>
                                    <span>
                                        Net: <strong className="text-slate-900">
                                            {formatCurrency(invoice.net_amount || invoice.invoice_amount)}
                                        </strong>
                                    </span>
                                    {invoice.due_date && (
                                        <span>
                                            Due: <strong className="text-slate-900">
                                                {formatDate(invoice.due_date)}
                                            </strong>
                                        </span>
                                    )}
                                </div>
                                {isColumnVisible('actions') && (
                                    <Link
                                        href={`/invoices/${invoice.id}`}
                                        className="font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        View →
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Main render
    return (
        <div className="space-y-6">
            {showSummaryCards && renderSummaryCards()}

            <Card>
                {variant !== 'compact' && (
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice List
                            {processedInvoices.length !== invoices.length && (
                                <Badge variant="secondary">
                                    {processedInvoices.length} of {invoices.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                )}
                <CardContent className={variant === 'compact' ? 'pt-0' : ''}>
                    {showToolbar && renderToolbar()}
                    {variant === 'table' ? renderTableVariant() : renderCompactVariant()}
                </CardContent>
            </Card>
        </div>
    );
}
