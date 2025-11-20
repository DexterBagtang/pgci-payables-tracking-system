import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/custom/StatusBadge';
import { Link, router } from '@inertiajs/react';
import { Receipt, AlertTriangle } from 'lucide-react';

/**
 * Invoices Tab Content
 * Lists all invoices associated with the PO
 * Principle: List view with proper empty state
 */
export default function POInvoicesTab({ invoices, currency, formatCurrency, formatDate }) {
    if (!invoices || invoices.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-base">
                        <Receipt className="mr-2 h-4 w-4 text-blue-600" />
                        Invoices (0)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="py-12 text-center text-slate-500">
                        <Receipt className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <div className="mb-2 text-lg font-medium">No invoices linked</div>
                        <p className="mb-4 text-sm text-slate-400">
                            Invoices will appear once created and associated with this PO
                        </p>
                        <Button variant="outline" size="sm" onClick={() => router.get('/invoices/create')}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Create Invoice
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-base">
                    <Receipt className="mr-2 h-4 w-4 text-blue-600" />
                    Invoices ({invoices.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="rounded-md border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="font-medium text-slate-900">SI #{invoice.si_number}</div>
                                    <div className="text-xs text-slate-500">{formatDate(invoice.si_date)}</div>
                                    {invoice.due_date &&
                                        new Date(invoice.due_date) < new Date() &&
                                        invoice.invoice_status !== 'paid' && (
                                        <Badge variant="destructive" className="text-xs">
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                            Overdue
                                        </Badge>
                                    )}
                                </div>
                                <StatusBadge status={invoice.invoice_status} />
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-600">
                                <div className="flex gap-4">
                                    <span>
                                        Amount: <strong className="text-slate-900">{formatCurrency(invoice.invoice_amount, currency)}</strong>
                                    </span>
                                    <span>
                                        Net: <strong className="text-slate-900">{formatCurrency(invoice.net_amount, currency)}</strong>
                                    </span>
                                    {invoice.due_date && (
                                        <span>
                                            Due: <strong className="text-slate-900">{formatDate(invoice.due_date)}</strong>
                                        </span>
                                    )}
                                </div>
                                <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                                    View →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
