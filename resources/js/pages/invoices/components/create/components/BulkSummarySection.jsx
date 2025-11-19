import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

export default function BulkSummarySection({ bulkSummary, bulkInvoices, errorCount, errors, processing }) {
    if (!bulkSummary) return null;

    return (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Summary Cards */}
            <Card className="shadow-sm">
                <CardContent className="pt-4">
                    <div className="text-center">
                        <div className="mb-1 text-sm text-slate-600">Total Invoices</div>
                        <div className="text-2xl font-bold text-blue-900">{bulkSummary.count}</div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardContent className="pt-4">
                    <div className="text-center">
                        <div className="mb-1 text-sm text-slate-600">Total Amount</div>
                        <div className="text-2xl font-bold text-green-900">
                            {bulkSummary.currency === 'USD' ? '$' : '₱'}
                            {bulkSummary.totalAmount.toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                            EX: {bulkSummary.currency === 'USD' ? '$' : '₱'}
                            {bulkSummary.totalVATExclusive.toFixed(2)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                            VAT: {bulkSummary.currency === 'USD' ? '$' : '₱'}
                            {bulkSummary.totalVAT.toFixed(2)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardContent className="pt-4">
                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Submit All ({bulkInvoices.length})
                        </Button>

                        {errorCount > 0 && (
                            <div className="text-center">
                                <div className="text-xs font-medium text-red-600">
                                    {errorCount} error{errorCount > 1 ? 's' : ''} found
                                </div>
                                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-red-700">
                                    {Object.entries(errors)
                                        .slice(0, 5)
                                        .map(([field, error]) => (
                                            <li key={field} className="flex items-center">
                                                <span className="mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-red-600"></span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                    {errorCount > 5 && (
                                        <li className="font-medium text-red-600">...and {errorCount - 5} more</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
