import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckSquare } from 'lucide-react';

export default function CheckReqStats({
    totalInvoices,
    selectedCount,
    loadedCount,
}) {
    return (
        <Card className="border-slate-200 shadow-sm shrink-0">
            <CardContent className="p-3">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Total Available</span>
                        </div>
                        <span className="font-semibold text-slate-900">{totalInvoices}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <CheckSquare className="h-3.5 w-3.5" />
                            <span>Selected</span>
                        </div>
                        <span className="font-semibold text-blue-600">{selectedCount}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Loaded</span>
                        <span className="font-medium text-slate-700">{loadedCount} / {totalInvoices}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                style={{
                                    width: `${totalInvoices > 0 ? (selectedCount / totalInvoices) * 100 : 0}%`
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 text-center">
                            {totalInvoices > 0 ? Math.round((selectedCount / totalInvoices) * 100) : 0}% selected
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
