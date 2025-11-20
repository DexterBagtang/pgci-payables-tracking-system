import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, FileText } from 'lucide-react';

/**
 * Check Requisition Financial Summary Cards
 * Displays requisition amount and total invoices amount
 * Principle: Single Responsibility - Only handles financial cards display
 */
export default function CRFinancialCards({
    requisitionAmount,
    totalInvoicesAmount,
    formatCurrency
}) {
    return (
        <div className="grid grid-cols-2 gap-4 mb-6 print:hidden">
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-600 font-medium">Requisition Amount</p>
                            <p className="text-lg font-bold text-blue-900">{formatCurrency(requisitionAmount)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-300" />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-600 font-medium">Total Invoices</p>
                            <p className="text-lg font-bold text-green-900">{formatCurrency(totalInvoicesAmount)}</p>
                        </div>
                        <FileText className="h-8 w-8 text-green-300" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
