import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, useRemember } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Edit,
    FileText,
    Printer,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import ActivityTimeline from '@/components/custom/ActivityTimeline.jsx';
import AttachmentViewer from '@/pages/invoices/components/AttachmentViewer.jsx';
import Remarks from '@/components/custom/Remarks.jsx';
import BackButton from '@/components/custom/BackButton.jsx';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';

const ShowDisbursement = ({ disbursement, checkRequisitions, files, financialMetrics, payees, projects, accounts }) => {
    const { canWrite } = usePermissions();
    const {
        activity_logs,
        remarks = [],
    } = disbursement;

    const [tab, setTab] = useRemember('overview', 'disbursement-detail-tab');

    // Memoized helper functions
    const formatCurrency = useCallback((amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }, []);

    const formatDate = useCallback((date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM dd, yyyy');
    }, []);

    // Determine disbursement status
    const getStatus = useCallback(() => {
        if (disbursement.date_check_released_to_vendor) {
            return { label: 'Released to Vendor', color: 'success', icon: CheckCircle2 };
        }
        if (disbursement.date_check_scheduled) {
            return { label: 'Scheduled for Release', color: 'warning', icon: Calendar };
        }
        if (disbursement.date_check_printing) {
            return { label: 'Printed', color: 'info', icon: Printer };
        }
        return { label: 'Draft', color: 'default', icon: Clock };
    }, [disbursement]);

    const status = useMemo(() => getStatus(), [getStatus]);
    const StatusIcon = status.icon;

    const isReleased = disbursement.date_check_released_to_vendor !== null;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto max-w-7xl space-y-6 p-6">
                    {/* Compact Header */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {disbursement.check_voucher_number}
                                    </h1>
                                    <Badge
                                        className={
                                            status.color === 'success' ? 'bg-green-500 hover:bg-green-600' :
                                            status.color === 'warning' ? 'bg-orange-500 hover:bg-orange-600' :
                                            status.color === 'info' ? 'bg-blue-500 hover:bg-blue-600' :
                                            'bg-slate-500 hover:bg-slate-600'
                                        }
                                    >
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {status.label}
                                    </Badge>
                                </div>
                                <div className="text-sm text-slate-600">
                                    {disbursement.date_check_printing && (
                                        <>Printed: {formatDate(disbursement.date_check_printing)}</>
                                    )}
                                    {disbursement.date_check_scheduled && (
                                        <> • Scheduled: {formatDate(disbursement.date_check_scheduled)}</>
                                    )}
                                    {disbursement.date_check_released_to_vendor && (
                                        <> • Released: {formatDate(disbursement.date_check_released_to_vendor)}</>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-shrink-0 gap-2">
                                {!isReleased && canWrite('disbursements') && (
                                    <Link href={`/disbursements/${disbursement.id}/edit`} prefetch>
                                        <Button variant="outline" size="sm">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                )}
                                <BackButton />
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-6 border-t pt-6">
                            <div className="flex items-center justify-between">
                                <div className={`flex items-center ${disbursement.date_check_printing ? 'text-blue-600' : 'text-slate-400'}`}>
                                    <Printer className="mr-2 h-5 w-5" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Check Printed</div>
                                        <div className="text-xs">{formatDate(disbursement.date_check_printing)}</div>
                                    </div>
                                </div>
                                <div className={`h-1 flex-1 mx-2 ${disbursement.date_check_scheduled ? 'bg-blue-500' : 'bg-slate-200'}`} />

                                <div className={`flex items-center ${disbursement.date_check_scheduled ? 'text-orange-600' : 'text-slate-400'}`}>
                                    <Calendar className="mr-2 h-5 w-5" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Scheduled for Release</div>
                                        <div className="text-xs">{formatDate(disbursement.date_check_scheduled)}</div>
                                    </div>
                                </div>
                                <div className={`h-1 flex-1 mx-2 ${disbursement.date_check_released_to_vendor ? 'bg-green-500' : 'bg-slate-200'}`} />

                                <div className={`flex items-center ${disbursement.date_check_released_to_vendor ? 'text-green-600' : 'text-slate-400'}`}>
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Released to Vendor</div>
                                        <div className="text-xs">{formatDate(disbursement.date_check_released_to_vendor)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Metrics Dashboard */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-sm font-medium text-slate-600">
                                    <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                    Total Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(financialMetrics.total_amount)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-sm font-medium text-slate-600">
                                    <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                                    Check Requisitions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {financialMetrics.check_requisition_count}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-sm font-medium text-slate-600">
                                    <Users className="mr-2 h-4 w-4 text-purple-600" />
                                    Payees
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                    {financialMetrics.payee_count}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-sm font-medium text-slate-600">
                                    <FileText className="mr-2 h-4 w-4 text-orange-600" />
                                    Invoices
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {financialMetrics.invoice_count}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payee Summary */}
                    {payees && payees.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building2 className="mr-2 h-5 w-5 text-purple-600" />
                                    Payee Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {payees.map((payee, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <div className="font-semibold text-slate-900">{payee.name}</div>
                                                <div className="text-sm text-slate-500">
                                                    {payee.check_requisition_count} check requisition{payee.check_requisition_count !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-green-600">
                                                {formatCurrency(payee.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabbed Content */}
                    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="check-requisitions">
                                CRs ({checkRequisitions.length})
                            </TabsTrigger>
                            <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
                            <TabsTrigger value="remarks">Remarks ({remarks.length})</TabsTrigger>
                            <TabsTrigger value="timeline">Activity</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Disbursement Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Disbursement Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Check Voucher Number</div>
                                            <div className="text-base font-semibold">{disbursement.check_voucher_number}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Date Check Printing</div>
                                            <div className="text-base">{formatDate(disbursement.date_check_printing)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Date Scheduled for Release</div>
                                            <div className="text-base">{formatDate(disbursement.date_check_scheduled)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Date Released to Vendor</div>
                                            <div className="text-base font-semibold">
                                                {formatDate(disbursement.date_check_released_to_vendor)}
                                            </div>
                                        </div>
                                        {disbursement.remarks && (
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Remarks</div>
                                                <div className="text-base">{disbursement.remarks}</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Projects & Accounts */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Projects & Accounts</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {projects && projects.length > 0 && (
                                            <div>
                                                <div className="mb-2 text-sm font-medium text-slate-500">Projects</div>
                                                <div className="space-y-2">
                                                    {projects.map((project, index) => (
                                                        <div key={index} className="rounded border p-2">
                                                            <div className="font-medium">{project.project_title}</div>
                                                            <div className="text-sm text-slate-600">CER: {project.cer_number}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {accounts && accounts.length > 0 && (
                                            <div>
                                                <div className="mb-2 text-sm font-medium text-slate-500">Account Codes</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {accounts.map((account, index) => (
                                                        <Badge key={index} variant="outline">{account}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Check Requisitions Tab */}
                        <TabsContent value="check-requisitions">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                                        Check Requisitions ({checkRequisitions.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {checkRequisitions.length > 0 ? (
                                        <div className="space-y-4">
                                            {checkRequisitions.map((cr) => (
                                                <div key={cr.id} className="rounded-lg border p-4">
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div>
                                                            <Link
                                                                href={`/check-requisitions/${cr.id}`}
                                                                className="font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {cr.requisition_number}
                                                            </Link>
                                                            <div className="text-sm text-slate-600">{cr.payee_name}</div>
                                                            {cr.purpose && (
                                                                <div className="mt-1 text-sm text-slate-500">{cr.purpose}</div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-green-600">
                                                                {formatCurrency(cr.php_amount)}
                                                            </div>
                                                            {cr.invoices && cr.invoices.length > 0 && (
                                                                <div className="text-sm text-slate-500">
                                                                    {cr.invoices.length} invoice{cr.invoices.length !== 1 ? 's' : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {cr.account_charge && (
                                                        <div className="text-sm text-slate-500">
                                                            Account: {cr.account_charge}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-slate-500">
                                            No check requisitions found
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Files Tab */}
                        <TabsContent value="files">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5 text-blue-600" />
                                        Attached Files ({files.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AttachmentViewer files={files} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Remarks Tab */}
                        <TabsContent value="remarks">
                            <Remarks
                                remarks={remarks}
                                remarkableType="Disbursement"
                                remarkableId={disbursement.id}
                            />
                        </TabsContent>

                        {/* Timeline Tab */}
                        <TabsContent value="timeline">
                            <ActivityTimeline
                                activity_logs={activity_logs}
                                title="Disbursement Activity History"
                                entityType="Disbursement"
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default ShowDisbursement;