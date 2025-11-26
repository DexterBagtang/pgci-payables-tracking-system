import { Card, CardContent } from '@/components/ui/card';
import {
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    TrendingUp,
} from 'lucide-react';

const DisbursementSummaryCards = ({ statistics, formatCurrency }) => {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Total Disbursements */}
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">
                                Total Disbursements
                            </p>
                            <p className="text-2xl font-bold">{statistics.total}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                All disbursements
                            </p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Total Amount */}
            <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">
                                Total Amount
                            </p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(statistics.total_amount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Total value
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Released */}
            <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">
                                Released
                            </p>
                            <p className="text-2xl font-bold">{statistics.released}</p>
                            <p className="text-xs font-medium text-gray-600 mt-0.5">
                                {formatCurrency(statistics.released_amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                                Released checks
                            </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Pending Release */}
            <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">
                                Pending Release
                            </p>
                            <p className="text-2xl font-bold">{statistics.pending}</p>
                            <p className="text-xs font-medium text-gray-600 mt-0.5">
                                {formatCurrency(statistics.pending_amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                                Awaiting release
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Scheduled */}
            <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">
                                Scheduled
                            </p>
                            <p className="text-2xl font-bold">{statistics.scheduled}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Scheduled for release
                            </p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Average Amount */}
            <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">
                                Average Amount
                            </p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(statistics.average_amount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Per disbursement
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-indigo-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DisbursementSummaryCards;
