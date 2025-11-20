import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, Receipt } from 'lucide-react';

/**
 * Financial Tab Content
 * Shows detailed financial breakdown and performance metrics
 * Principle: Tab-specific financial details
 */
export default function POFinancialTab({
    financialMetrics,
    currency,
    invoicesLength,
    formatCurrency,
    formatPercentage,
    onViewInvoicesClick
}) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Enhanced Financial Breakdown */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                        <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                        Detailed Financial Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Subtotal (VAT Excluded)</span>
                            <span className="font-medium">{formatCurrency(financialMetrics.vatExAmount, currency)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">VAT (12%)</span>
                            <span className="font-medium">{formatCurrency(financialMetrics.vatAmount, currency)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Total PO Amount</span>
                            <span className="font-bold text-green-600">{formatCurrency(financialMetrics.poAmount, currency)}</span>
                        </div>
                    </div>

                    {/* Invoice Summary */}
                    <div className="border-t pt-4">
                        <h4 className="mb-3 font-medium text-slate-800">Invoice Summary</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Total Invoiced:</span>
                                <div className="text-right">
                                    <span className="font-medium text-orange-600">
                                        {formatCurrency(financialMetrics.totalInvoicedAmount, currency)}
                                    </span>
                                    <div className="text-xs text-slate-400">
                                        {formatPercentage(financialMetrics.invoicedPercentage)} of PO
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Amount Paid:</span>
                                <div className="text-right">
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(financialMetrics.paidAmount, currency)}
                                    </span>
                                    <div className="text-xs text-slate-400">
                                        {formatPercentage(financialMetrics.paidPercentage)} of invoiced
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t pt-3">
                                <span className="font-medium text-slate-500">Outstanding Balance:</span>
                                <div className="text-right">
                                    <span className={`font-bold ${
                                        financialMetrics.outstandingAmount === 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {formatCurrency(financialMetrics.outstandingAmount, currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                        <Target className="mr-2 h-5 w-5 text-blue-600" />
                        Performance Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Completion Status */}
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-green-600">
                            {formatPercentage(financialMetrics.completionPercentage)}
                        </div>
                        <div className="text-sm text-slate-600">PO Completion</div>
                        <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                            <div
                                className="h-2 rounded-full bg-green-600 transition-all duration-300"
                                style={{ width: `${Math.min(financialMetrics.completionPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Invoice Metrics */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Total Invoices</span>
                            <Badge variant="outline" className="font-semibold">{invoicesLength}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Paid Invoices</span>
                            <Badge variant="default" className="bg-green-100 text-green-800 font-semibold">
                                {financialMetrics.paidInvoices}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Pending Invoices</span>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-semibold">
                                {financialMetrics.pendingInvoices}
                            </Badge>
                        </div>
                        {financialMetrics.overdueInvoices > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Overdue Invoices</span>
                                <Badge variant="destructive" className="font-semibold">
                                    {financialMetrics.overdueInvoices}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Timeline Info */}
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Days Since PO:</span>
                            <span className="font-medium">{financialMetrics.daysSincePO} days</span>
                        </div>
                        {financialMetrics.daysToDelivery !== null && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">
                                    {financialMetrics.daysToDelivery >= 0 ? 'Days to Delivery:' : 'Days Overdue:'}
                                </span>
                                <span className={`font-medium ${
                                    financialMetrics.daysToDelivery < 0 ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {Math.abs(financialMetrics.daysToDelivery)} days
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button variant="outline" size="sm" className="w-full" onClick={onViewInvoicesClick}>
                            <Receipt className="mr-2 h-4 w-4" />
                            View All Invoices
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
