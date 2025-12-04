import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Users, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function DisbursementFinancialPreview({ selectedCheckReqs, allCheckReqs }) {
    const [isPayeesExpanded, setIsPayeesExpanded] = useState(true);

    // Calculate metrics
    const selectedData = allCheckReqs.filter(cr => selectedCheckReqs.includes(cr.id));

    const totalAmount = selectedData.reduce((sum, cr) => sum + parseFloat(cr.php_amount || 0), 0);
    const totalInvoices = selectedData.reduce((sum, cr) => sum + (cr.invoices_with_aging?.length || 0), 0);

    // Get unique payees with amounts
    const payeeMap = selectedData.reduce((acc, cr) => {
        const payee = cr.payee_name;
        if (!acc[payee]) {
            acc[payee] = { name: payee, amount: 0, count: 0 };
        }
        acc[payee].amount += parseFloat(cr.php_amount || 0);
        acc[payee].count += 1;
        return acc;
    }, {});

    const payees = Object.values(payeeMap);

    // Calculate average aging
    const allInvoices = selectedData.flatMap(cr => cr.invoices_with_aging || []);
    const totalAging = allInvoices.reduce((sum, inv) => sum + (inv.aging_days || 0), 0);
    const averageAging = allInvoices.length > 0 ? Math.round(totalAging / allInvoices.length) : 0;

    const formatCurrency = (amount) => {
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    if (selectedCheckReqs.length === 0) {
        return (
            <Card className="sticky top-6">
                <CardHeader>
                    <CardTitle className="text-lg">Financial Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-slate-500">
                        <DollarSign className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-2 text-sm">Select check requisitions to see financial preview</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="sticky top-6 space-y-4">
            {/* Main Financial Metrics */}
            <Card className="border-l-4 border-l-green-500 shadow-lg">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-medium text-slate-600">
                        <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                        Total Disbursement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(totalAmount)}
                    </div>
                </CardContent>
            </Card>

            {/* Other Metrics */}
            <div className="grid grid-cols-1 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-slate-600">Check Requisitions</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{selectedCheckReqs.length}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-slate-600">Payees</span>
                            </div>
                            <span className="text-xl font-bold text-purple-600">{payees.length}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-orange-600" />
                                <span className="text-sm text-slate-600">Invoices</span>
                            </div>
                            <span className="text-xl font-bold text-orange-600">{totalInvoices}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Average Aging */}
            {allInvoices.length > 0 && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Average Aging</span>
                            <Badge
                                variant={averageAging > 60 ? 'destructive' : averageAging > 30 ? 'warning' : 'success'}
                                className={
                                    averageAging > 60 ? 'bg-red-500' :
                                    averageAging > 30 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }
                            >
                                {averageAging} days
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payee Breakdown */}
            {payees.length > 0 && (
                <Card>
                    <Collapsible open={isPayeesExpanded} onOpenChange={setIsPayeesExpanded}>
                        <CardHeader className="pb-3">
                            <CollapsibleTrigger className="flex w-full items-center justify-between hover:opacity-80">
                                <CardTitle className="text-sm font-medium text-slate-700">
                                    Payee Breakdown
                                </CardTitle>
                                {isPayeesExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-slate-500" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                )}
                            </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="space-y-2">
                                {payees.map((payee, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate text-sm font-medium text-slate-900">
                                                {payee.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {payee.count} CR{payee.count !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="ml-2 text-right">
                                            <div className="text-sm font-semibold text-green-600">
                                                {formatCurrency(payee.amount)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>
            )}
        </div>
    );
}
