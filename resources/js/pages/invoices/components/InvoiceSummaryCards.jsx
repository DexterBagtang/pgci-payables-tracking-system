import { Card, CardContent } from '@/components/ui/card';
import {
    AlertCircle,
    Clock,
    DollarSign,
    FileText,
    TrendingUp,
} from 'lucide-react';

const InvoiceSummaryCards = ({ summary, formatCurrency }) => {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Invoices</p>
                            <p className="text-2xl font-bold">{summary.total}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Amount</p>
                            <p className="text-lg font-bold">{formatCurrency(summary.totalAmount)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">Pending Review</p>
                            <p className="text-2xl font-bold">{summary.pending}</p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">For Disbursement</p>
                            <p className="text-2xl font-bold">{summary.pendingDisbursement}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500">Overdue</p>
                            <p className="text-2xl font-bold">{summary.overdue}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoiceSummaryCards;
