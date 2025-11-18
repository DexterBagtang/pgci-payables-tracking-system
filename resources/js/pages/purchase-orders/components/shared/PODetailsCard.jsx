import { formatCurrency } from '@/components/custom/helpers.jsx';
import { Badge } from '@/components/ui/badge.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Separator } from '@/components/ui/separator.js';
import { Textarea } from '@/components/ui/textarea.js';
import { FileText, AlertCircle } from 'lucide-react';
import PoDateSelection from '@/pages/purchase-orders/components/create/PoDateSelection.jsx';
import ProjectSelection from '@/pages/purchase-orders/components/create/ProjectSelection.jsx';
import VendorSelection from '@/pages/purchase-orders/components/create/VendorSelection.jsx';

/**
 * PODetailsCard Component
 * Shared UI component for displaying and editing PO basic details
 * Used by both CreatePOForm and EditPOForm with client-side validation
 * 
 * @param {Object} props
 * @param {Object} props.data - Form data object
 * @param {Function} props.setData - Function to update form data
 * @param {Object} props.errors - Form validation errors (combined client & server)
 * @param {Array} props.vendors - List of vendor options
 * @param {Array} props.projects - List of project options
 * @param {string} props.mode - 'create' or 'edit'
 * @param {boolean} props.isDraft - Whether PO is saved as draft
 * @param {Function} props.onDraftChange - Callback when draft status changes
 * @param {string} props.projectId - Optional initial project ID for create mode
 */
export default function PODetailsCard({
    data,
    setData,
    errors,
    vendors,
    projects,
    mode = 'create',
    isDraft,
    onDraftChange,
    projectId,
}) {
    /**
     * Get styling for input based on error state
     */
    const getInputClassName = (fieldName) => {
        return errors?.[fieldName] ? 'border-red-500 focus:ring-red-500' : '';
    };

    return (
        <>
            {/* Combined Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Purchase Order Details
                    </CardTitle>
                    <CardDescription>
                        {mode === 'create' 
                            ? 'Enter all the details for the purchase order' 
                            : 'Update the details for the purchase order'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Project & Vendor Selection */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ProjectSelection 
                            projects={projects} 
                            data={data} 
                            setData={setData} 
                            errors={errors} 
                            project_id={projectId}
                        />

                        <VendorSelection 
                            vendors={vendors} 
                            data={data} 
                            setData={setData} 
                            errors={errors} 
                        />
                    </div>

                    {/* Top Section: PO Number, Date, Currency, Amount */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* PO Number */}
                        <div className="space-y-2">
                            <Label htmlFor="po_number" className={errors?.po_number ? 'text-red-600' : ''}>
                                PO Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="po_number"
                                value={data.po_number}
                                onChange={(e) => setData('po_number', e.target.value)}
                                placeholder="e.g., PO-2024-001"
                                className={getInputClassName('po_number')}
                            />
                            {errors?.po_number && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.po_number}
                                </p>
                            )}
                        </div>

                        {/* PO Date */}
                        <div>
                            <PoDateSelection data={data} setData={setData} errors={errors} />
                            {errors?.po_date && (
                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.po_date}
                                </p>
                            )}
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <Label htmlFor="currency" className={errors?.currency ? 'text-red-600' : ''}>
                                Currency
                            </Label>
                            <Select
                                value={data.currency || 'PHP'}
                                onValueChange={(value) => setData('currency', value)}
                            >
                                <SelectTrigger className={getInputClassName('currency')}>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PHP">PHP (₱)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors?.currency && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.currency}
                                </p>
                            )}
                        </div>

                        {/* PO Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="po_amount" className={errors?.po_amount ? 'text-red-600' : ''}>
                                PO Amount <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                    {data.currency === 'USD' ? '$' : '₱'}
                                </span>
                                <Input
                                    id="po_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.po_amount}
                                    onChange={(e) => setData('po_amount', e.target.value)}
                                    className={`pl-8 ${getInputClassName('po_amount')}`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors?.po_amount && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.po_amount}
                                </p>
                            )}

                            {/* Tax Breakdown */}
                            {data.po_amount && !errors?.po_amount && (
                                <div className="mt-1 rounded-md bg-muted/40 p-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            VAT Ex ({data.currency === 'USD' ? '$' : '₱'})
                                        </span>
                                        <span className="font-medium text-muted-foreground">
                                            {formatCurrency((parseFloat(data.po_amount) || 0) / 1.12, data.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">VAT (12%)</span>
                                        <span className="font-medium text-muted-foreground">
                                            {formatCurrency(((parseFloat(data.po_amount) || 0) * 0.12) / 1.12, data.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={'text-sm text-muted-foreground'}>Total</span>
                                        <p className="text-sm font-medium">{formatCurrency(data.po_amount, data.currency)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Section: Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className={errors?.description ? 'text-red-600' : ''}>
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter purchase order description..."
                            rows={mode === 'edit' ? 3 : 2}
                            className={getInputClassName('description')}
                        />
                        {errors?.description && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Financial & Timeline Information */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="payment_term" className={errors?.payment_term ? 'text-red-600' : ''}>
                                Payment Terms
                            </Label>
                            <Textarea
                                id="payment_term"
                                value={data.payment_term}
                                onChange={(e) => setData('payment_term', e.target.value)}
                                placeholder="e.g., Net 30, Due on receipt, 2% 10 Net 30"
                                className={`w-full ${getInputClassName('payment_term')}`}
                                rows={2}
                            />
                            {errors?.payment_term && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.payment_term}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section: Save as Draft Checkbox */}
                    <div className="flex items-center space-x-2 border-t pt-4">
                        <Checkbox 
                            id="is_draft" 
                            checked={isDraft} 
                            onCheckedChange={onDraftChange}
                        />
                        <Label
                            htmlFor="is_draft"
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Save as Draft
                        </Label>
                        <Separator orientation="vertical" className={'mx-6'} />
                        <Label>Status:</Label>
                        {isDraft ? (
                            <Badge variant="secondary" className="ml-2">
                                Draft
                            </Badge>
                        ) : (
                            <Badge variant="default" className="ml-2">
                                Open
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
