import { Card, CardContent } from '@/components/ui/card';
import { Receipt, ArrowLeft, Sparkles } from 'lucide-react';

export default function EmptyInvoiceState() {
    return (
        <Card className="shadow-sm border-2 border-dashed border-blue-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-blue-100 p-4 mb-4">
                    <Receipt className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Add Invoices</h3>
                <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
                    Configure your settings above, then click the "Generate" button to create invoice rows
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                    <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-full bg-blue-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold">
                                1
                            </div>
                            <h4 className="font-semibold text-sm text-blue-900">Configure</h4>
                        </div>
                        <p className="text-xs text-blue-700">
                            Set invoice count and shared fields
                        </p>
                    </div>

                    <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-full bg-purple-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold">
                                2
                            </div>
                            <h4 className="font-semibold text-sm text-purple-900">Generate</h4>
                        </div>
                        <p className="text-xs text-purple-700">
                            Create invoice rows automatically
                        </p>
                    </div>

                    <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-full bg-green-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold">
                                3
                            </div>
                            <h4 className="font-semibold text-sm text-green-900">Upload & Submit</h4>
                        </div>
                        <p className="text-xs text-green-700">
                            Add files and submit all invoices
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2">
                    <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                        <strong>Pro tip:</strong> Use Range mode (e.g., 2210-2299) to auto-generate sequential SI numbers
                    </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Complete the configuration above to get started</span>
                </div>
            </CardContent>
        </Card>
    );
}
