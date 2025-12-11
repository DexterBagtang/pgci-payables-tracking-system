import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/custom/DatePicker.jsx';
import { formatCurrency } from '@/components/custom/helpers.jsx';
import { FileText } from 'lucide-react';

export default function CheckReqFormDetails({ data, setData, errors }) {
    return (
        <Card className="border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="border-b bg-white px-3 py-2 space-y-0 shrink-0">
                <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-semibold text-xs text-slate-900">Requisition Details</span>
                </div>
            </CardHeader>

            <CardContent className="p-3 flex-1 overflow-y-auto">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-slate-700">Request Date</Label>
                            <DatePicker
                                value={data.request_date}
                                onChange={(value) => setData("request_date", value)}
                                className="text-xs h-8"
                            />
                            {errors?.request_date && (
                                <p className="text-xs text-red-600 mt-0.5">{errors.request_date}</p>
                            )}
                        </div>
                        <div>
                            <Label className="text-xs text-slate-700">PHP Amount</Label>
                            <Input
                                readOnly
                                value={formatCurrency(data.php_amount)}
                                className="text-xs h-8 bg-slate-50 font-semibold text-emerald-700"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-slate-700">Payee Name</Label>
                        <Input
                            value={data.payee_name}
                            onChange={(e) => setData("payee_name", e.target.value)}
                            className="text-xs h-8"
                        />
                        {errors?.payee_name && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.payee_name}</p>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs text-slate-700">Purpose</Label>
                        <Textarea
                            rows={5}
                            value={data.purpose}
                            onChange={(e) => setData("purpose", e.target.value)}
                            className="text-xs resize-y"
                        />
                        {errors?.purpose && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.purpose}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label className="text-xs text-slate-700">PO Number</Label>
                            <Input
                                value={data.po_number}
                                onChange={(e) => setData("po_number", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-700">CER Number</Label>
                            <Input
                                value={data.cer_number}
                                onChange={(e) => setData("cer_number", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-700">SI Number</Label>
                            <Input
                                value={data.si_number}
                                onChange={(e) => setData("si_number", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs text-slate-700">Account Charge</Label>
                            <Input
                                value={data.account_charge}
                                onChange={(e) => setData("account_charge", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-700">Service Line Dist.</Label>
                            <Input
                                value={data.service_line_dist}
                                onChange={(e) => setData("service_line_dist", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-slate-700">Amount in Words</Label>
                        <Input
                            readOnly
                            value={data.amount_in_words}
                            className="text-xs h-8 bg-slate-50"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label className="text-xs text-slate-700">Requested By</Label>
                            <Input
                                value={data.requested_by}
                                onChange={(e) => setData("requested_by", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-700">Reviewed By</Label>
                            <Input
                                value={data.reviewed_by}
                                onChange={(e) => setData("reviewed_by", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-700">Approved By</Label>
                            <Input
                                value={data.approved_by}
                                onChange={(e) => setData("approved_by", e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
