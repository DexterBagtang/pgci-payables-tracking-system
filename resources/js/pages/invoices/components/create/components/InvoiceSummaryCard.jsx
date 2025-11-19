import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { calculateVAT } from '../utils/invoiceCalculations';

export default function InvoiceSummaryCard({ singleData, selectedPO }) {
    const vatBreakdown = calculateVAT(singleData.invoice_amount);

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Calculator className="mr-2 h-4 w-4 text-blue-600" />
                    Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-3">
                    <div className="rounded border bg-slate-50 p-3 text-center">
                        <div className="mb-1 text-sm text-slate-600">Invoice Amount</div>
                        <div className="text-2xl font-bold text-slate-900">
                            {singleData.currency === 'USD' ? '$' : '₱'}
                            {Number(singleData.invoice_amount || 0).toLocaleString()}
                        </div>
                    </div>

                    {singleData.invoice_amount && (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between rounded bg-slate-50 p-2">
                                <span>VATable Amount:</span>
                                <span className="font-medium">
                                    {singleData.currency === 'USD' ? '$' : '₱'}
                                    {vatBreakdown.vatableAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between rounded bg-slate-50 p-2">
                                <span>VAT (12%):</span>
                                <span className="font-medium">
                                    {singleData.currency === 'USD' ? '$' : '₱'}
                                    {vatBreakdown.vatAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {selectedPO && (
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                        <h4 className="mb-2 text-sm font-medium text-blue-800">Selected PO</h4>
                        <div className="space-y-1 text-xs text-blue-700">
                            <div className="flex justify-between">
                                <span>PO:</span>
                                <span className="font-medium">{selectedPO.po_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Vendor:</span>
                                <span className="ml-2 truncate font-medium">{selectedPO.vendor_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">
                                    {selectedPO.currency === 'USD' ? '$' : '₱'}
                                    {Number(selectedPO.po_amount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
