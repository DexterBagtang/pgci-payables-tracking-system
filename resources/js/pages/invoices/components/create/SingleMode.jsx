import { Button } from '@/components/ui/button.js';
import { Calendar } from '@/components/ui/calendar.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Textarea } from '@/components/ui/textarea.js';
import { cn } from '@/lib/utils.js';
import { format } from 'date-fns';
import { CalendarIcon, FileText, Upload, X } from 'lucide-react';
import { DatePicker } from '@/components/custom/DatePicker.jsx';
import { RequiredLabel } from '@/components/custom/RequiredLabel.jsx';
import { PaymentTermsSelect } from '@/components/custom/PaymentTermsSelect.jsx';

export default function SingleMode({
    singleData,
    setSingleData,
    errors,
    submitToOptions,
    handleDateSelect,
    selectedPO,
    calculatePOPercentage,
    calculateVAT,
    paymentTermsOptions,
    handleFileChange,
    selectedFiles,
    removeFile,
}) {
    console.log(singleData);
    return (
        <>
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                        <FileText className="mr-2 h-4 w-4 text-green-600" />
                        Invoice Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-sm font-medium">SI Number<RequiredLabel/></Label>
                            <Input
                                value={singleData.si_number}
                                onChange={(e) =>
                                    setSingleData((prev) => ({
                                        ...prev,
                                        si_number: e.target.value,
                                    }))
                                }
                                placeholder="e.g., SI-2024-001"
                                className="mt-1"
                            />
                            {errors.si_number && <p className="mt-1 text-xs text-red-600">{errors.si_number}</p>}
                        </div>


                        <DatePicker
                            label="SI Date"
                            value={singleData.si_date}
                            onChange={(date) => handleDateSelect('si_date', date)}
                            error={errors.si_date}
                            required={true}
                        />

                        <div>
                            <Label className="text-sm font-medium">Invoice Amount<RequiredLabel/></Label>
                            <div className="mt-1 space-y-2">
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={singleData.invoice_amount}
                                        onChange={(e) =>
                                            setSingleData((prev) => ({
                                                ...prev,
                                                invoice_amount: e.target.value,
                                            }))
                                        }
                                        placeholder="0.00"
                                        className="pr-16"
                                    />
                                    {selectedPO && singleData.invoice_amount && (
                                        <div className="absolute top-0 right-1 flex h-10 items-center">
                                            <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                                {calculatePOPercentage(singleData.invoice_amount, selectedPO.po_amount).toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* VAT Breakdown */}
                                {singleData.invoice_amount && (
                                    <div className="rounded-md border bg-slate-50 p-2">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Vatable Amount:</span>
                                                <span className="font-medium">
                                                    ₱{calculateVAT(singleData.invoice_amount).vatableAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">VAT (12%):</span>
                                                <span className="font-medium">₱{calculateVAT(singleData.invoice_amount).vatAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.invoice_amount && <p className="mt-1 text-xs text-red-600">{errors.invoice_amount}</p>}
                        </div>


                        <PaymentTermsSelect
                            value={singleData.terms_of_payment}
                            onChange={(value) =>
                                setSingleData((prev) => ({
                                    ...prev,
                                    terms_of_payment: value,
                                }))
                            }
                            otherValue={singleData.other_payment_terms}
                            onOtherChange={(value) =>
                                setSingleData((prev) => ({
                                    ...prev,
                                    other_payment_terms: value,
                                }))
                            }
                            error={errors.terms_of_payment}
                            otherError={errors.other_payment_terms}
                            paymentTermsOptions={paymentTermsOptions}
                            required={true}
                        />


                        <DatePicker
                            label={"SI Received Date"}
                            value={singleData.si_received_at}
                            onChange={(date) => handleDateSelect('si_received_at', date)}
                            error={errors.si_received_at}
                            required={true}
                        />


                        <DatePicker
                            label={"Due Date"}
                            value={singleData.due_date}
                            onChange={(date) => handleDateSelect('due_date', date)}
                            error={errors.due_date}
                            required={false}
                        />

                        <div>
                            <Label className="text-sm font-medium">Submit To *</Label>
                            <Select
                                value={singleData.submitted_to}
                                onValueChange={(value) =>
                                    setSingleData((prev) => ({
                                        ...prev,
                                        submitted_to: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select recipient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {submitToOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.submitted_to && <p className="mt-1 text-xs text-red-600">{errors.submitted_to}</p>}
                        </div>

                        <DatePicker
                            label={"Submission Date"}
                            value={singleData.submitted_at}
                            onChange={(date) => handleDateSelect('submitted_at', date)}
                            error={errors.submitted_at}
                            required={true}
                        />

                    </div>

                    <div>
                        <Label className="text-sm font-medium">Notes</Label>
                        <Textarea
                            value={singleData.notes}
                            onChange={(e) =>
                                setSingleData((prev) => ({
                                    ...prev,
                                    notes: e.target.value,
                                }))
                            }
                            placeholder="Additional notes about this invoice..."
                            rows={3}
                            className="mt-1 resize-none"
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                        <Upload className="mr-2 h-4 w-4 text-orange-600" />
                        Attachments <RequiredLabel/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <label
                                htmlFor="files"
                                className={cn(
                                    "inline-block cursor-pointer rounded bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100",
                                    errors.files && "ring-2 ring-red-500"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    <span>Upload Files</span>
                                </div>
                            </label>
                            <input
                                id="files"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                                className="hidden"
                            />
                            <p className="mt-1 text-xs text-slate-500">PDF, DOC, XLS, JPG, PNG (Max: 10MB per file)</p>
                            {errors.files && <p className="mt-1 text-xs text-red-600">{errors.files}</p>}
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Selected Files ({selectedFiles.length})</Label>
                                <div className="space-y-1">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between rounded border bg-slate-50 p-2 text-sm">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium text-slate-900">{file.name}</p>
                                                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-800"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
