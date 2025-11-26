import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { CheckCircle2, Clock, Calendar, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RecentDisbursements({ disbursements = [] }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (disbursements.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Recent Disbursements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Check Voucher #</TableHead>
                                <TableHead>Scheduled Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>CRs</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {disbursements.map((disbursement) => (
                                <TableRow key={disbursement.id}>
                                    <TableCell>
                                        <Link
                                            href={`/disbursements/${disbursement.id}`}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {disbursement.check_voucher_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3 w-3 text-gray-400" />
                                            {formatDate(disbursement.date_check_scheduled)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(disbursement.total_amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {disbursement.check_req_count} CR(s)
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {disbursement.status === 'released' ? (
                                            <Badge className="bg-green-50 text-green-700 border-green-200">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Released
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Pending
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {disbursement.creator_name}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
