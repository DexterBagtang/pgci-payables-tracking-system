import { useState } from 'react';
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
import {
    Badge
} from '@/components/ui/badge';
import {
    Button
} from '@/components/ui/button';
import {
    Input
} from '@/components/ui/input';
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
    Download
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import StatusBadge from '@/components/custom/StatusBadge.jsx';

export default function VendorInvoices({ vendor }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');

    // Get all invoices from purchase orders
    const allInvoices = vendor.purchase_orders.flatMap(po =>
        (po.invoices || []).map(invoice => ({
            ...invoice,
            po_number: po.po_number,
            project_title: po.project.project_title
        }))
    );

    // Filter invoices
    const filteredInvoices = allInvoices.filter(invoice => {
        const matchesSearch =
            invoice.si_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.project_title?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || invoice.invoice_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Sort invoices
    const sortedInvoices = [...filteredInvoices].sort((a, b) => {
        switch (sortBy) {
            case 'date_desc':
                return new Date(b.si_date) - new Date(a.si_date);
            case 'date_asc':
                return new Date(a.si_date) - new Date(b.si_date);
            case 'amount_desc':
                return b.net_amount - a.net_amount;
            case 'amount_asc':
                return a.net_amount - b.net_amount;
            default:
                return 0;
        }
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status, dueDate) => {
        const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'paid';

        if (isOverdue) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                </Badge>
            );
        }

        return (
            <StatusBadge status={status} size={'sm'} />
        );
    };

    // Calculate totals for filtered invoices
    const filteredTotals = {
        count: sortedInvoices.length,
        invoiced: sortedInvoices.reduce((sum, inv) => sum + (inv.net_amount || 0), 0),
        paid: sortedInvoices.filter(inv => inv.invoice_status === 'paid')
            .reduce((sum, inv) => sum + (inv.net_amount || 0), 0),
        pending: sortedInvoices.filter(inv => inv.invoice_status !== 'paid')
            .reduce((sum, inv) => sum + (inv.net_amount || 0), 0)
    };

    console.log(vendor);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Invoices</p>
                                <p className="text-2xl font-bold">{filteredTotals.count}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-lg font-bold">{formatCurrency(filteredTotals.invoiced)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Paid</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(filteredTotals.paid)}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-lg font-bold text-orange-600">
                                    {formatCurrency(filteredTotals.pending)}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Invoice List
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by SI number, PO number, or project..."
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

                    {/* Invoices Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SI Number</TableHead>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>SI Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedInvoices.length > 0 ? (
                                    sortedInvoices.map((invoice) => {
                                        const isOverdue = invoice.due_date &&
                                            new Date(invoice.due_date) < new Date() &&
                                            invoice.invoice_status !== 'paid';

                                        return (
                                            <TableRow
                                                key={invoice.id}
                                                className={isOverdue ? 'bg-red-50/50' : ''}
                                            >
                                                <TableCell className="font-medium">
                                                    {invoice.si_number}
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`purchase-orders/${invoice.purchase_order_id})`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {invoice.po_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {invoice.project_title}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        {formatDate(invoice.si_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {isOverdue && (
                                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                                        )}
                                                        {formatDate(invoice.due_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(invoice.net_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(invoice.invoice_status, invoice.due_date)}
                                                </TableCell>
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
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            No invoices found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
