import { Card, CardContent } from '@/components/ui/card';
import { Receipt, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

/**
 * Invoice Status Overview Cards
 * Displays total, paid, pending, and overdue invoice counts
 * Principle: Focused Component - Only displays invoice statistics
 */
export default function POInvoiceStatusCards({ financialMetrics, totalInvoices }) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
                <CardContent className="p-4 text-center">
                    <Receipt className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                    <p className="text-lg font-bold">{totalInvoices}</p>
                    <p className="text-xs text-gray-600">Total Invoices</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-500" />
                    <p className="text-lg font-bold text-green-600">{financialMetrics.paidInvoices}</p>
                    <p className="text-xs text-gray-600">Paid Invoices</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <Clock className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
                    <p className="text-lg font-bold text-yellow-600">{financialMetrics.pendingInvoices}</p>
                    <p className="text-xs text-gray-600">Pending Invoices</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 text-center">
                    <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-500" />
                    <p className="text-lg font-bold text-red-600">{financialMetrics.overdueInvoices}</p>
                    <p className="text-xs text-gray-600">Overdue Invoices</p>
                </CardContent>
            </Card>
        </div>
    );
}
