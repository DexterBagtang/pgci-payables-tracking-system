import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import StatusBadge from '@/components/custom/StatusBadge';

/**
 * Check Requisition Invoices Tab
 * Displays list of invoices with search and filter
 * Principle: Single Responsibility - Only handles invoices list display
 */
export default function CRInvoicesTab({
    invoices,
    totalInvoicesAmount,
    isAmountMatching,
    formatDate,
    formatCurrency
}) {
    const [searchInvoice, setSearchInvoice] = useState('');
    const [invoiceFilter, setInvoiceFilter] = useState('all');

    // Filter invoices
    const filteredInvoices = invoices?.filter(inv => {
        const matchesSearch = inv.si_number.toLowerCase().includes(searchInvoice.toLowerCase());
        const matchesFilter = invoiceFilter === 'all' || inv.invoice_status === invoiceFilter;
        return matchesSearch && matchesFilter;
    }) || [];

    if (!invoices || invoices.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No invoices associated with this check requisition</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    Associated Invoices ({filteredInvoices.length}/{invoices.length})
                </h3>
                <div className="flex gap-2 print:hidden">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search SI..."
                            value={searchInvoice}
                            onChange={(e) => setSearchInvoice(e.target.value)}
                            className="pl-8 h-8 w-40 text-xs"
                        />
                    </div>
                    <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="h-9">SI Number</TableHead>
                            <TableHead className="h-9">Date</TableHead>
                            <TableHead className="h-9 text-right">Invoice Amt</TableHead>
                            <TableHead className="h-9 text-right">Net Amount</TableHead>
                            <TableHead className="h-9">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-slate-50">
                                <TableCell className="font-mono text-sm py-2">
                                    {invoice.si_number}
                                </TableCell>
                                <TableCell className="text-sm py-2">
                                    {formatDate(invoice.si_date)}
                                </TableCell>
                                <TableCell className="text-sm text-right py-2">
                                    {formatCurrency(invoice.invoice_amount)}
                                </TableCell>
                                <TableCell className="text-sm text-right font-medium py-2">
                                    {formatCurrency(invoice.net_amount)}
                                </TableCell>
                                <TableCell className="py-2">
                                    <StatusBadge status={invoice.invoice_status} size="sm" />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-muted/30 font-semibold">
                            <TableCell colSpan={3} className="text-right py-2">
                                Total:
                            </TableCell>
                            <TableCell className="text-right py-2 text-blue-600">
                                {formatCurrency(totalInvoicesAmount)}
                            </TableCell>
                            <TableCell className="py-2">
                                {isAmountMatching ? (
                                    <Badge variant="outline" className="text-xs bg-green-50 border-green-300">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Matched
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-red-50 border-red-300">
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                        Mismatch
                                    </Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
