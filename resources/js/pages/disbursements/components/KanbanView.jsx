import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    Calendar,
    Clock,
    CheckCircle2,
    FileText,
    Eye,
    Zap
} from 'lucide-react';
import { formatCurrency } from '@/components/custom/helpers';
import { format } from 'date-fns';
import QuickReleaseModal from './QuickReleaseModal';

export default function KanbanView() {
    const [kanbanData, setKanbanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDisbursement, setSelectedDisbursement] = useState(null);
    const [showQuickRelease, setShowQuickRelease] = useState(false);

    useEffect(() => {
        fetchKanbanData();
    }, []);

    const fetchKanbanData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/disbursements/kanban-data');
            const data = await response.json();
            setKanbanData(data);
        } catch (error) {
            console.error('Failed to fetch kanban data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickRelease = (disbursement) => {
        setSelectedDisbursement(disbursement);
        setShowQuickRelease(true);
    };

    const getAgingBadge = (agingStatus, maxAging) => {
        const variants = {
            critical: { color: 'bg-red-100 text-red-700 border-red-300', label: `${Math.round(maxAging)} days` },
            warning: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: `${Math.round(maxAging)} days` },
            good: { color: 'bg-green-100 text-green-700 border-green-300', label: `${Math.round(maxAging)} days` },
        };

        const variant = variants[agingStatus] || variants.good;

        return (
            <Badge className={`${variant.color} border font-semibold`}>
                {variant.label}
            </Badge>
        );
    };

    const DisbursementCard = ({ disbursement, columnType }) => {
        const isPending = !disbursement.date_check_released_to_vendor;

        return (
            <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    {disbursement.check_voucher_number}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {disbursement.cr_count} CR(s)
                                </p>
                            </div>
                            {disbursement.aging_status && (
                                <div>
                                    {getAgingBadge(disbursement.aging_status, disbursement.max_aging)}
                                </div>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="text-lg font-bold text-green-700">
                            {formatCurrency(disbursement.total_amount)}
                        </div>

                        {/* Scheduled Date */}
                        {disbursement.date_check_scheduled && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3 w-3" />
                                Scheduled: {format(new Date(disbursement.date_check_scheduled), 'MMM dd, yyyy')}
                            </div>
                        )}

                        {/* Released Date */}
                        {disbursement.date_check_released_to_vendor && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Released: {format(new Date(disbursement.date_check_released_to_vendor), 'MMM dd, yyyy')}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1"
                                onClick={() => router.visit(`/disbursements/${disbursement.id}`)}
                            >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                            </Button>
                            {isPending && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleQuickRelease(disbursement)}
                                >
                                    <Zap className="h-3 w-3 mr-1" />
                                    Release
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const KanbanColumn = ({ title, items, color, icon: Icon, columnType }) => {
        const totalAmount = items.reduce((sum, item) => sum + (item.total_amount || 0), 0);

        return (
            <div className="flex-1 min-w-[280px]">
                <Card className={`border-t-4 ${color}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {title}
                            </CardTitle>
                            <Badge variant="secondary" className="font-bold">
                                {items.length}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold mt-1">
                            {formatCurrency(totalAmount)}
                        </p>
                    </CardHeader>
                    <CardContent className="max-h-[600px] overflow-y-auto">
                        {items.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">
                                No disbursements
                            </p>
                        ) : (
                            items.map((item) => (
                                <DisbursementCard
                                    key={item.id}
                                    disbursement={item}
                                    columnType={columnType}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading kanban view...</p>
                </div>
            </div>
        );
    }

    if (!kanbanData) {
        return (
            <Alert>
                <AlertDescription>Failed to load kanban data</AlertDescription>
            </Alert>
        );
    }

    const { columns, summary } = kanbanData;

    return (
        <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Overdue for Release</p>
                                <p className="text-2xl font-bold text-red-700">{summary.overdue_count}</p>
                                <p className="text-xs font-semibold text-gray-600 mt-1">
                                    {formatCurrency(summary.overdue_amount)}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Due This Week</p>
                                <p className="text-2xl font-bold text-yellow-700">{summary.due_this_week_count}</p>
                                <p className="text-xs font-semibold text-gray-600 mt-1">
                                    {formatCurrency(summary.due_this_week_amount)}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Critical Aging (&gt;60 days)</p>
                                <p className="text-2xl font-bold text-orange-700">{summary.critical_aging_count}</p>
                                <p className="text-xs font-semibold text-gray-600 mt-1">
                                    Requires immediate attention
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                <KanbanColumn
                    title="Overdue for Release"
                    items={columns.overdue}
                    color="border-t-red-500"
                    icon={AlertTriangle}
                    columnType="overdue"
                />
                <KanbanColumn
                    title="Due This Week"
                    items={columns.due_this_week}
                    color="border-t-yellow-500"
                    icon={Clock}
                    columnType="due_this_week"
                />
                <KanbanColumn
                    title="Scheduled Later"
                    items={columns.scheduled_later}
                    color="border-t-blue-500"
                    icon={Calendar}
                    columnType="scheduled_later"
                />
                <KanbanColumn
                    title="Released"
                    items={columns.released}
                    color="border-t-green-500"
                    icon={CheckCircle2}
                    columnType="released"
                />
            </div>

            {/* Quick Release Modal */}
            {selectedDisbursement && (
                <QuickReleaseModal
                    disbursement={selectedDisbursement}
                    open={showQuickRelease}
                    onClose={() => {
                        setShowQuickRelease(false);
                        setSelectedDisbursement(null);
                    }}
                    onSuccess={() => {
                        fetchKanbanData();
                    }}
                />
            )}
        </div>
    );
}
