import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

/**
 * Financial Metrics Dashboard Cards
 * Displays PO Amount, Invoiced, Paid, Outstanding, and Completion metrics
 * Principle: Presentational Component - Receives data and displays it
 */
export default function POFinancialCards({ financialMetrics, currency, formatCurrency, formatPercentage }) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* PO Amount */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">PO Amount</p>
                        <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(financialMetrics.poAmount, currency)}
                        </p>
                        <div className="space-y-1 text-xs text-gray-500">
                            <div>VAT Ex: {formatCurrency(financialMetrics.vatExAmount, currency)}</div>
                            <div>VAT (12%): {formatCurrency(financialMetrics.vatAmount, currency)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invoiced */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Invoiced</p>
                        <p className="text-lg font-bold text-orange-600">
                            {financialMetrics.totalInvoicedAmount > 0
                                ? formatCurrency(financialMetrics.totalInvoicedAmount, currency)
                                : <span className="text-gray-400">{currency === 'USD' ? '$0.00' : '₱0.00'}</span>}
                        </p>
                        <div className="space-y-1">
                            <Progress
                                value={Math.min(financialMetrics.invoicedPercentage, 100)}
                                className={`h-2 ${
                                    financialMetrics.invoicedPercentage >= 80 ? '[&>div]:bg-green-500' :
                                    financialMetrics.invoicedPercentage >= 50 ? '[&>div]:bg-yellow-500' :
                                    '[&>div]:bg-orange-500'
                                }`}
                            />
                            <div className="flex items-center justify-between text-xs">
                                <span>of PO</span>
                                <Badge variant={
                                    financialMetrics.invoicedPercentage >= 80 ? 'default' :
                                    financialMetrics.invoicedPercentage >= 50 ? 'secondary' : 'outline'
                                } className="text-xs font-semibold">
                                    {formatPercentage(financialMetrics.invoicedPercentage)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Paid */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Paid</p>
                        <p className="text-lg font-bold text-green-600">
                            {financialMetrics.paidAmount > 0
                                ? formatCurrency(financialMetrics.paidAmount, currency)
                                : <span className="text-gray-400">{currency === 'USD' ? '$0.00' : '₱0.00'}</span>}
                        </p>
                        <div className="space-y-1">
                            <Progress
                                value={Math.min(financialMetrics.paidPercentage, 100)}
                                className={`h-2 ${
                                    financialMetrics.paidPercentage >= 90 ? '[&>div]:bg-green-500' :
                                    financialMetrics.paidPercentage >= 70 ? '[&>div]:bg-blue-500' :
                                    financialMetrics.paidPercentage >= 30 ? '[&>div]:bg-yellow-500' :
                                    '[&>div]:bg-red-500'
                                }`}
                            />
                            <div className="flex items-center justify-between text-xs">
                                <span>of Invoiced</span>
                                <Badge variant={
                                    financialMetrics.paidPercentage >= 90 ? 'default' :
                                    financialMetrics.paidPercentage >= 70 ? 'secondary' :
                                    financialMetrics.paidPercentage >= 30 ? 'outline' : 'destructive'
                                } className="text-xs font-semibold">
                                    {formatPercentage(financialMetrics.paidPercentage)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Outstanding */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Outstanding</p>
                        <p className={`text-lg font-bold ${
                            financialMetrics.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                            {formatCurrency(financialMetrics.outstandingAmount, currency)}
                        </p>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span>Pending Payment:</span>
                                <span className="font-medium">
                                    {formatCurrency(financialMetrics.pendingInvoiceAmount, currency)}
                                </span>
                            </div>
                            <Badge variant={
                                financialMetrics.outstandingAmount === 0 ? 'default' : 'destructive'
                            } className="w-full justify-center text-xs">
                                {financialMetrics.outstandingAmount === 0 ? 'Fully Paid' : 'Pending'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Completion */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Completion</p>
                        <p className="text-lg font-bold text-green-600">
                            {formatPercentage(financialMetrics.completionPercentage)}
                        </p>
                        <div className="space-y-1">
                            <Progress
                                value={Math.min(financialMetrics.completionPercentage, 100)}
                                className={`h-2 ${
                                    financialMetrics.completionPercentage >= 100 ? '[&>div]:bg-green-500' :
                                    financialMetrics.completionPercentage >= 75 ? '[&>div]:bg-blue-500' :
                                    financialMetrics.completionPercentage >= 50 ? '[&>div]:bg-yellow-500' :
                                    '[&>div]:bg-red-500'
                                }`}
                            />
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span>Invoices:</span>
                                    <span className="font-medium">{financialMetrics.paidInvoices + financialMetrics.pendingInvoices}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
