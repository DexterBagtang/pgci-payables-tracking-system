import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
    CalendarIcon,
    PlayCircle,
    Zap
} from 'lucide-react';

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
    const isReadyToGenerate = bulkConfig.count > 0 && selectedFieldsCount > 0;


    return (
        <Card className="w-full border-slate-200 shadow-lg">
            {/* Header with Count, Prefix, and Generate */}
            <CardHeader className="pb-3 px-4 pt-3">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <Label htmlFor="count" className="text-xs text-slate-600">Number of Invoices</Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={bulkConfig.count}
                                    onChange={(e) => setBulkConfig(prev => ({
                                        ...prev,
                                        count: parseInt(e.target.value) || 1
                                    }))}
                                    className="h-7  text-xs mt-0.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="prefix" className="text-xs text-slate-600">Invoice number Prefix</Label>
                                <Input
                                    id="prefix"
                                    value={bulkConfig.siPrefix}
                                    onChange={(e) => setBulkConfig(prev => ({
                                        ...prev,
                                        siPrefix: e.target.value
                                    }))}
                                    placeholder="e.g. SI-2024-"
                                    className="h-7 text-xs mt-0.5 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={isReadyToGenerate ? "default" : "secondary"}>
                            {selectedFieldsCount} fields
                        </Badge>
                        <Button
                            onClick={generateBulkInvoices}
                            disabled={!isReadyToGenerate}
                            size="sm"
                            type="button"
                            className={cn(
                                "h-7 px-4 text-xs font-medium",
                                isReadyToGenerate
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-slate-300"
                            )}
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
                            {sharedFieldOptions.filter(option => !option.required).map(field => {
                                const isSelected = bulkConfig.sharedFields[field.key];
                                return (
                                    <label
                                        key={field.key}
                                        className={cn(
                                            "flex items-center gap-2 p-1 rounded-lg border cursor-pointer transition-all",
                                            isSelected
                                                ? "border-blue-200 bg-blue-50 shadow-sm"
                                                : "border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => setBulkConfig(prev => ({
                                                ...prev,
                                                sharedFields: {
                                                    ...prev.sharedFields,
                                                    [field.key]: checked
                                                }
                                            }))}
                                            disabled={field.required}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side: Value Configuration Inputs */}
                    <div className="col-span-3 space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Configure Values</Label>
                        <div className="space-y-1 grid grid-cols-1 lg:grid-cols-3 gap-2">
                            {selectedFieldsCount === 0 ? (
                                <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg">
                                    <p className="text-sm text-slate-500">Select fields to configure values</p>
                                </div>
                            ) : (
                                Object.entries(bulkConfig.sharedFields).map(([fieldKey, isShared]) => {
                                    if (!isShared || fieldKey === 'purchase_order_id') return null;

                                    const fieldConfig = sharedFieldOptions.find(f => f.key === fieldKey);

                                    // Date Fields
                                    if (['si_date', 'si_received_at', 'submitted_at', 'due_date'].includes(fieldKey)) {
                                        return (
                                            <div key={fieldKey} className="space-y-1">
                                                <Label className="text-xs text-slate-600">{fieldConfig.label}</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full h-8 justify-start px-3 text-left font-normal",
                                                                !bulkConfig.sharedValues[fieldKey] && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            <span>
                                                                {bulkConfig.sharedValues[fieldKey]
                                                                    ? format(new Date(bulkConfig.sharedValues[fieldKey]), 'MMM dd, yyyy')
                                                                    : 'Select date'}
                                                            </span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={bulkConfig.sharedValues[fieldKey] ? new Date(bulkConfig.sharedValues[fieldKey]) : undefined}
                                                            onSelect={(date) => handleBulkConfigDateSelect(fieldKey, date)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                    {errors[fieldKey] && (
                                                        <p className="mt-1 text-xs text-red-600">

                                                            {errors[fieldKey]}
                                                        </p>
                                                    )}
                                                </Popover>
                                            </div>
                                        );
                                    }

                                    // Select Fields
                                    if (fieldKey === 'submitted_to') {
                                        return (
                                            <div key={fieldKey} className="space-y-1">
                                                <Label className="text-xs text-slate-600">Submitted To</Label>
                                                <Select
                                                    value={bulkConfig.sharedValues[fieldKey]}
                                                    onValueChange={(value) => setBulkConfig(prev => ({
                                                        ...prev,
                                                        sharedValues: {
                                                            ...prev.sharedValues,
                                                            [fieldKey]: value
                                                        }
                                                    }))}
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {submitToOptions.map(option => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors[fieldKey] && (
                                                    <p className="mt-1 text-xs text-red-600">

                                                        {errors[fieldKey]}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }

                                    if (fieldKey === 'terms_of_payment') {
                                        return (
                                            <div key={fieldKey} className="space-y-1">
                                                <Label className="text-xs text-slate-600">Payment Terms</Label>
                                                <Select
                                                    value={bulkConfig.sharedValues[fieldKey]}
                                                    onValueChange={(value) => setBulkConfig(prev => ({
                                                        ...prev,
                                                        sharedValues: {
                                                            ...prev.sharedValues,
                                                            [fieldKey]: value
                                                        }
                                                    }))}
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Select terms" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {paymentTermsOptions.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        );
                                    }

                                    // Notes Field
                                    if (fieldKey === 'notes') {
                                        return (
                                            <div key={fieldKey} className="space-y-1">
                                                <Label className="text-xs text-slate-600">Shared Notes</Label>
                                                <Input
                                                    value={bulkConfig.sharedValues.notes || ''}
                                                    onChange={(e) => setBulkConfig(prev => ({
                                                        ...prev,
                                                        sharedValues: {
                                                            ...prev.sharedValues,
                                                            notes: e.target.value
                                                        }
                                                    }))}
                                                    placeholder="Notes to appear on all invoices..."
                                                    className={"h-8"}
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
