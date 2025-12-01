import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Disbursement, type CheckRequisition, type FileAttachment, type ActivityLog, type Remark } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    FileText,
    Edit,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import ActivityTimeline from '@/components/custom/ActivityTimeline';
import Remarks from '@/components/custom/Remarks';
import AttachmentsCard from '@/components/custom/AttachmentsCard';

interface PageProps {
    disbursement: Disbursement & {
        activity_logs?: ActivityLog[];
        remarks?: Remark[];
    };
    checkRequisitions: CheckRequisition[];
    files: FileAttachment[];
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};

export default function ShowDisbursementPage({
    disbursement,
    checkRequisitions,
    files,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Disbursements',
            href: '/disbursements',
        },
        {
            title: disbursement.check_voucher_number,
            href: `/disbursements/${disbursement.id}`,
        },
    ];

    const isReleased = disbursement.date_check_released_to_vendor !== null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Disbursement ${disbursement.check_voucher_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{disbursement.check_voucher_number}</h1>
                        <p className="text-sm text-gray-500">
                            Created {formatDate(disbursement.created_at)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!isReleased && (
                            <Link href={`/disbursements/${disbursement.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Details Card */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Disbursement Information</CardTitle>
                                    {isReleased ? (
                                        <Badge className="bg-green-500">
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            Released
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Pending Release
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Check Voucher Number
                                        </p>
                                        <p className="text-base font-semibold">
                                            {disbursement.check_voucher_number}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Created By</p>
                                        <p className="text-base">{disbursement.creator?.name || '-'}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Date Check Scheduled
                                        </p>
                                        <p className="text-base">
                                            {formatDate(disbursement.date_check_scheduled)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Date Check Printing
                                        </p>
                                        <p className="text-base">
                                            {formatDate(disbursement.date_check_printing)}
                                        </p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium text-gray-500">
                                            Date Check Released to Vendor
                                        </p>
                                        <p className="text-base font-semibold">
                                            {formatDate(disbursement.date_check_released_to_vendor)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Check Requisitions & Invoices */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Check Requisitions & Invoices</CardTitle>
                                <CardDescription>
                                    {checkRequisitions.length} check requisition(s) included in this
                                    disbursement
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {checkRequisitions.map((cr: any) => (
                                    <div key={cr.id} className="mb-6 last:mb-0">
                                        <div className="mb-2 flex items-center justify-between">
                                            <div>
                                                <Link
                                                    href={`/check-requisitions/${cr.id}`}
                                                    className="font-semibold text-blue-600 hover:underline"
                                                >
                                                    {cr.requisition_number}
                                                </Link>
                                                <p className="text-sm text-gray-600">{cr.payee_name}</p>
                                            </div>
                                            <p className="font-semibold">
                                                {formatCurrency(cr.php_amount)}
                                            </p>
                                        </div>

                                        {/* Invoices Table */}
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>SI Number</TableHead>
                                                        <TableHead>Vendor</TableHead>
                                                        <TableHead>Amount</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Aging (days)</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {cr.invoices?.map((invoice: any) => (
                                                        <TableRow key={invoice.id}>
                                                            <TableCell className="font-medium">
                                                                <Link
                                                                    href={`/invoices/${invoice.id}`}
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    {invoice.si_number}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell>
                                                                {invoice.purchase_order?.vendor?.name || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatCurrency(invoice.net_amount)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        invoice.invoice_status === 'paid'
                                                                            ? 'default'
                                                                            : 'secondary'
                                                                    }
                                                                >
                                                                    {invoice.invoice_status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {invoice.aging_days !== null ? (
                                                                    <Badge
                                                                        variant={
                                                                            invoice.aging_days > 60
                                                                                ? 'destructive'
                                                                                : 'outline'
                                                                        }
                                                                    >
                                                                        {invoice.aging_days} days
                                                                    </Badge>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Supporting Documents */}
                        <AttachmentsCard
                            files={files}
                            title="Supporting Documents"
                            readonly={true}
                            storageBasePath="/storage/"
                        />
                    </div>
                </div>

                {/* Activity Timeline */}
                {disbursement.activity_logs && disbursement.activity_logs.length > 0 && (
                    <div className="mt-6">
                        <ActivityTimeline
                            activity_logs={disbursement.activity_logs}
                            title="Disbursement Activity History"
                            entityType="disbursement"
                        />
                    </div>
                )}

                {/* Remarks Section */}
                <div className="mt-6">
                    <Remarks
                        remarkableType="Disbursement"
                        remarkableId={disbursement.id}
                        remarks={disbursement.remarks || []}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
