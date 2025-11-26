import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlayCircle, Zap, Hash } from 'lucide-react';
import { DatePicker } from '@/components/custom/DatePicker.jsx';
import { PaymentTermsSelect } from '@/components/custom/PaymentTermsSelect.jsx';
import { RequiredLabel } from '@/components/custom/RequiredLabel.jsx';
import { CurrencyToggle } from '@/components/custom/CurrencyToggle.jsx';
import { useEffect } from 'react';

export default function BulkConfiguration({
    bulkConfig,
    setBulkConfig,
    generateBulkInvoices,
    sharedFieldOptions,
    handleBulkConfigDateSelect,
    submitToOptions,
    paymentTermsOptions,
    errors,
}) {
    const selectedFieldsCount = Object.values(bulkConfig.sharedFields).filter(Boolean).length;

    // Validation: Check if ready to generate based on mode
    const isReadyToGenerate = (() => {
        if (selectedFieldsCount === 0) return false;

        if (bulkConfig.inputMode === 'range') {
            // Range mode: Need valid range values and calculated count
            return bulkConfig.count > 0 && bulkConfig.rangeStart && bulkConfig.rangeEnd;
        } else {
            // Manual mode: Just need a count > 0
            return bulkConfig.count > 0;
        }
    })();

    // Auto-calculate count when in range mode
    useEffect(() => {
        if (bulkConfig.inputMode === 'range' && bulkConfig.rangeStart && bulkConfig.rangeEnd) {
            const start = parseInt(bulkConfig.rangeStart);
            const end = parseInt(bulkConfig.rangeEnd);
            if (!isNaN(start) && !isNaN(end) && end >= start) {
                const calculatedCount = end - start + 1;
                setBulkConfig((prev) => ({
                    ...prev,
                    count: calculatedCount,
                    autoIncrementEnabled: true, // Auto-enable increment in range mode
                }));
            }
        }
    }, [bulkConfig.inputMode, bulkConfig.rangeStart, bulkConfig.rangeEnd, setBulkConfig]);

    return (
        <Card className="w-full border-slate-200 shadow-lg">
            {/* Header with Count, Prefix, and Generate */}
            <CardHeader className="px-4 pt-3 pb-3">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-600 p-1.5">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Input Mode Toggle */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-600">Input Mode</Label>
                                <Tabs
                                    value={bulkConfig.inputMode}
                                    onValueChange={(value) =>
                                        setBulkConfig((prev) => ({
                                            ...prev,
                                            inputMode: value,
                                            // Reset range values when switching to manual
                                            ...(value === 'manual' && {
                                                rangeStart: '',
                                                rangeEnd: '',
                                                autoIncrementEnabled: false,
                                            }),
                                        }))
                                    }
                                    className="mt-0.5"
                                >
                                    <TabsList className="h-7">
                                        <TabsTrigger value="manual" className="text-xs h-6">
                                            <Hash className="h-3 w-3 mr-1" />
                                            Manual Count
                                        </TabsTrigger>
                                        <TabsTrigger value="range" className="text-xs h-6">
                                            Range
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Manual Mode: Number of Invoices */}
                            {bulkConfig.inputMode === 'manual' && (
                                <div>
                                    <Label htmlFor="count" className="text-xs text-slate-600">
                                        Number of Invoices
                                    </Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={bulkConfig.count ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setBulkConfig(prev => ({
                                                ...prev,
                                                count: val === "" ? "" : parseInt(val)
                                            }));
                                        }}
                                        className="mt-0.5 h-7 text-xs w-28"
                                    />

                                </div>
                            )}

                            {/* Range Mode: Range Start and End */}
                            {bulkConfig.inputMode === 'range' && (
                                <div className="flex items-center gap-2">
                                    <div>
                                        <Label htmlFor="rangeStart" className="text-xs text-slate-600">
                                            Range Start
                                        </Label>
                                        <Input
                                            id="rangeStart"
                                            type="number"
                                            min="1"
                                            value={bulkConfig.rangeStart}
                                            onChange={(e) =>
                                                setBulkConfig((prev) => ({
                                                    ...prev,
                                                    rangeStart: e.target.value,
                                                }))
                                            }
                                            placeholder="e.g. 001"
                                            className="mt-0.5 h-7 text-xs w-24"
                                        />
                                    </div>
                                    <span className="text-slate-400 mt-5">-</span>
                                    <div>
                                        <Label htmlFor="rangeEnd" className="text-xs text-slate-600">
                                            Range End
                                        </Label>
                                        <Input
                                            id="rangeEnd"
                                            type="number"
                                            min="1"
                                            value={bulkConfig.rangeEnd}
                                            onChange={(e) =>
                                                setBulkConfig((prev) => ({
                                                    ...prev,
                                                    rangeEnd: e.target.value,
                                                }))
                                            }
                                            placeholder="e.g. 050"
                                            className="mt-0.5 h-7 text-xs w-24"
                                        />
                                    </div>
                                    {bulkConfig.rangeStart && bulkConfig.rangeEnd && (
                                        <div className="mt-5">
                                            <Badge variant="default" className="bg-green-600 text-white">
                                                {bulkConfig.count} invoices
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Only show Starting Invoice Number in Manual Mode */}
                            {bulkConfig.inputMode === 'manual' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="prefix" className="text-xs text-slate-600">
                                        Starting Invoice Number
                                    </Label>
                                    <Input
                                        id="prefix"
                                        type="text"
                                        value={bulkConfig.siPrefix}
                                        onChange={(e) =>
                                            setBulkConfig((prev) => ({
                                                ...prev,
                                                siPrefix: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. 1234 or 00067"
                                        className="h-7 font-mono text-xs w-40"
                                    />
                                    {bulkConfig.siPrefix && (
                                        <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Checkbox
                                                    id="autoIncrement"
                                                    checked={bulkConfig.autoIncrementEnabled}
                                                    onCheckedChange={(checked) =>
                                                        setBulkConfig((prev) => ({
                                                            ...prev,
                                                            autoIncrementEnabled: checked,
                                                        }))
                                                    }
                                                    className="h-3.5 w-3.5"
                                                />
                                                <Label htmlFor="autoIncrement" className="cursor-pointer text-xs font-medium text-slate-700">
                                                    Auto-increment
                                                </Label>
                                            </div>
                                            {bulkConfig.autoIncrementEnabled && (
                                                <div className="ml-auto flex items-center gap-1 text-xs font-mono">
                                                    <span className="text-slate-500">Preview:</span>
                                                    {(() => {
                                                        const baseNum = bulkConfig.siPrefix || '';
                                                        const startingNumber = parseInt(baseNum) || 0;
                                                        const paddingLength = baseNum.length;
                                                        const previewCount = Math.min(bulkConfig.count, 4);

                                                        return Array.from({ length: previewCount }, (_, i) => {
                                                            const num = startingNumber + i;
                                                            const formatted = String(num).padStart(paddingLength, '0');
                                                            return (
                                                                <span key={i} className="text-blue-700 font-semibold">
                                                                    {formatted}
                                                                    {i < previewCount - 1 && <span className="text-slate-400">, </span>}
                                                                </span>
                                                            );
                                                        });
                                                    })()}
                                                    {bulkConfig.count > 4 && (
                                                        <span className="text-slate-500">... +{bulkConfig.count - 4} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Show preview in Range Mode */}
                            {bulkConfig.inputMode === 'range' && bulkConfig.rangeStart && bulkConfig.rangeEnd && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-600">Preview</Label>
                                    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                                        <div className="flex items-center gap-1 text-xs font-mono">
                                            <span className="text-slate-500">SI Numbers:</span>
                                            {(() => {
                                                const start = parseInt(bulkConfig.rangeStart);
                                                const previewCount = Math.min(bulkConfig.count, 3);

                                                return Array.from({ length: previewCount }, (_, i) => {
                                                    const num = start + i;
                                                    return (
                                                        <span key={i} className="text-blue-700 font-semibold">
                                                            {num}
                                                            {i < previewCount - 1 && <span className="text-slate-400">,</span>}
                                                        </span>
                                                    );
                                                });
                                            })()}
                                            {bulkConfig.count > 3 && (
                                                <span className="text-slate-500">...+{bulkConfig.count - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={isReadyToGenerate ? 'default' : 'secondary'}>{selectedFieldsCount} fields</Badge>
                        <Button
                            onClick={generateBulkInvoices}
                            disabled={!isReadyToGenerate}
                            size="sm"
                            type="button"
                            className={cn('h-7 px-4 text-xs font-medium', isReadyToGenerate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300')}
                        >
                            <PlayCircle className="mr-1 h-3 w-3" />
                            Generate {bulkConfig.count}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
                {/* Split Layout: Checkboxes Left | Input Fields Right */}
                <div className="grid grid-cols-4 gap-6">
                    {/* Left Side: Field Selection Checkboxes */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Shared Fields</Label>
                        <div className="space-y-1">
                            {sharedFieldOptions
                                .filter((option) => !option.required)
                                .map((field) => {
                                    const isSelected = bulkConfig.sharedFields[field.key];
                                    return (
                                        <label
                                            key={field.key}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 rounded-lg border p-1 transition-all',
                                                isSelected ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50',
                                            )}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) =>
                                                    setBulkConfig((prev) => ({
                                                        ...prev,
                                                        sharedFields: {
                                                            ...prev.sharedFields,
                                                            [field.key]: checked,
                                                        },
                                                    }))
                                                }
                                                disabled={field.required}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm font-medium text-slate-700">
                                                {field.label}
                                                {field.required && <span className="ml-1 text-red-500">*</span>}
                                            </span>
                                        </label>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Right Side: Value Configuration Inputs */}
                    <div className="col-span-3 space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Configure Values</Label>
                        <div className="grid grid-cols-1 gap-2 space-y-1 lg:grid-cols-3">
                            {selectedFieldsCount === 0 ? (
                                <div className="col-span-3 flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/30">
                                    <Settings className="h-12 w-12 text-blue-400 mb-3" />
                                    <p className="text-sm font-medium text-slate-700 mb-1">No shared fields selected</p>
                                    <p className="text-xs text-slate-500 mb-3 text-center max-w-md">
                                        Check fields on the left to share values across all invoices
                                    </p>
                                    <div className="rounded bg-white border border-blue-200 px-3 py-2 text-xs text-blue-700">
                                        <strong>Tip:</strong> Start by selecting fields like Currency, SI Date, or Payment Terms
                                    </div>
                                </div>
                            ) : (
                                Object.entries(bulkConfig.sharedFields).map(([fieldKey, isShared]) => {
                                    if (!isShared || fieldKey === 'purchase_order_id') return null;

                                    const fieldConfig = sharedFieldOptions.find((f) => f.key === fieldKey);

                                    // Currency Field
                                    if (fieldKey === 'currency') {
                                        return (
                                            <div key={fieldKey} className="">
                                                <Label className="text-xs">Currency<RequiredLabel/></Label>
                                                <div className="mt-1">
                                                    <CurrencyToggle
                                                        value={bulkConfig.sharedValues[fieldKey] || 'PHP'}
                                                        onChange={(value) =>
                                                            setBulkConfig((prev) => ({
                                                                ...prev,
                                                                sharedValues: {
                                                                    ...prev.sharedValues,
                                                                    [fieldKey]: value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                {errors[fieldKey] && <p className="mt-1 text-xs text-red-600">{errors[fieldKey]}</p>}
                                            </div>
                                        );
                                    }

                                    // Invoice Amount Field
                                    if (fieldKey === 'invoice_amount') {
                                        return (
                                            <div key={fieldKey} className="">
                                                <Label className="text-xs">Shared Amount</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={bulkConfig.sharedValues[fieldKey] || ''}
                                                    onChange={(e) =>
                                                        setBulkConfig((prev) => ({
                                                            ...prev,
                                                            sharedValues: {
                                                                ...prev.sharedValues,
                                                                [fieldKey]: e.target.value,
                                                            },
                                                        }))
                                                    }
                                                    placeholder="0.00"
                                                    className="h-8 mt-1 text-xs"
                                                />
                                                {errors[fieldKey] && <p className="mt-1 text-xs text-red-600">{errors[fieldKey]}</p>}
                                            </div>
                                        );
                                    }

                                    // Date Fields
                                    if (['si_date', 'si_received_at', 'submitted_at', 'due_date'].includes(fieldKey)) {
                                        return (
                                            <DatePicker
                                                key={fieldKey}
                                                label={fieldConfig.label}
                                                value={bulkConfig.sharedValues[fieldKey]}
                                                onChange={(date) => handleBulkConfigDateSelect(fieldKey, date)}
                                                error={errors[fieldKey]}
                                                size="sm"
                                                className="space-y-1"
                                                required={fieldKey !== 'due_date'}
                                            />
                                        );
                                    }

                                    // Select Fields
                                    if (fieldKey === 'submitted_to') {
                                        return (
                                            <div key={fieldKey} className="">
                                                <Label className="text-xs ">Submitted To<RequiredLabel/></Label>
                                                <Select
                                                    value={bulkConfig.sharedValues[fieldKey]}
                                                    onValueChange={(value) =>
                                                        setBulkConfig((prev) => ({
                                                            ...prev,
                                                            sharedValues: {
                                                                ...prev.sharedValues,
                                                                [fieldKey]: value,
                                                            },
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 mt-1 text-xs">
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {submitToOptions.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors[fieldKey] && <p className="mt-1 text-xs text-red-600">{errors[fieldKey]}</p>}
                                            </div>
                                        );
                                    }

                                    if (fieldKey === 'terms_of_payment') {
                                        return (
                                                <PaymentTermsSelect
                                                    key={fieldKey}
                                                    value={bulkConfig.sharedValues[fieldKey]}
                                                    onChange={(value) =>
                                                        setBulkConfig((prev) => ({
                                                            ...prev,
                                                            sharedValues: {
                                                                ...prev.sharedValues,
                                                                [fieldKey]: value,
                                                            },
                                                        }))
                                                    }
                                                    otherValue={bulkConfig.sharedValues.other_payment_terms || ''}
                                                    onOtherChange={(value) =>
                                                        setBulkConfig((prev) => ({
                                                            ...prev,
                                                            sharedValues: {
                                                                ...prev.sharedValues,
                                                                other_payment_terms: value,
                                                            },
                                                        }))
                                                    }
                                                    error={errors[fieldKey]}
                                                    otherError={errors.other_payment_terms}
                                                    paymentTermsOptions={paymentTermsOptions}
                                                    required={true}
                                                    size="sm"
                                                />
                                        );
                                    }

                                    // Notes Field
                                    if (fieldKey === 'notes') {
                                        return (
                                            <div key={fieldKey} className="space-y-1">
                                                <Label className="text-xs ">Shared Notes</Label>
                                                <Input
                                                    value={bulkConfig.sharedValues.notes || ''}
                                                    onChange={(e) =>
                                                        setBulkConfig((prev) => ({
                                                            ...prev,
                                                            sharedValues: {
                                                                ...prev.sharedValues,
                                                                notes: e.target.value,
                                                            },
                                                        }))
                                                    }
                                                    placeholder="Notes to appear on all invoices..."
                                                    className={'h-8'}
                                                />
                                            </div>
                                        );
                                    }

                                    return null;
                                })
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
