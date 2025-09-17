import { formatCurrency } from '@/components/custom/helpers.jsx';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import { Calendar } from '@/components/ui/calendar.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.js';
import { Separator } from '@/components/ui/separator.js';
import { Textarea } from '@/components/ui/textarea.js';
import { cn } from '@/lib/utils.js';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, FileText, Save } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { toast } from 'sonner';

const ProjectSelection = lazy(() => import('@/pages/purchase-orders/components/create/ProjectSelection.jsx'));
const VendorSelection = lazy(()=> import('@/pages/purchase-orders/components/create/VendorSelection.jsx'));

export default function CreatePOForm({ vendors, projects }) {
    const [isDraft, setIsDraft] = useState(false);
    const [files, setFiles] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        po_number: '',
        project_id: '',
        vendor_id: '',
        po_amount: '',
        payment_term: '',
        po_date: '',
        expected_delivery_date: '',
        description: '',
        po_status: 'open',
        line_items: [],
        files: [], // Add this line
    });

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setData('files', selectedFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/purchase-orders', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('PO added successfully.');
                reset();
                setFiles([]);
            },
        });
    };

    function handleDraft(checked) {
        setData('po_status', checked ? 'draft' : 'open');
        setIsDraft(checked);
    }

    return (
        <>
            <Head title="Create Purchase Order" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="mb-4 flex items-center gap-4">
                            <Button variant="outline" asChild>
                                <Link href="/purchase-orders">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Purchase Orders
                                </Link>
                            </Button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Create New Purchase Order</h1>
                            <p className="mt-2 text-sm text-gray-600">Fill out the form below to create a new purchase order</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Combined Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Purchase Order Details
                                </CardTitle>
                                <CardDescription>Enter all the details for the purchase order</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Top Section: PO Number, Date, Amount */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="po_number">PO Number</Label>
                                        <Input
                                            id="po_number"
                                            value={data.po_number}
                                            onChange={(e) => setData('po_number', e.target.value)}
                                            placeholder="e.g., PO-2024-001"
                                            error={errors.po_number}
                                        />
                                        {errors.po_number && <p className="text-sm text-red-600">{errors.po_number}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="po_date">PO Date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !data.po_date && 'text-muted-foreground',
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.po_date ? format(new Date(data.po_date), 'PPP') : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0">
                                                <Calendar
                                                    className="w-full"
                                                    mode="single"
                                                    selected={data.po_date ? new Date(data.po_date) : undefined}
                                                    onSelect={(date) => setData('po_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                                    captionLayout={'dropdown'}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.po_date && <p className="text-sm text-red-600">{errors.po_date}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="po_amount">PO Amount *</Label>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">₱</span>
                                            <Input
                                                id="po_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.po_amount}
                                                onChange={(e) => setData('po_amount', e.target.value)}
                                                className="pl-8"
                                                placeholder="0.00"
                                                // readOnly={lineItems.length > 0}
                                            />
                                        </div>
                                        {errors.po_amount && <p className="text-sm text-red-600">{errors.po_amount}</p>}

                                        {/* Tax Breakdown */}
                                        {data.po_amount && (
                                            <div className="mt-1 rounded-md bg-muted/40 p-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">VAT Ex (₱)</span>
                                                    <span className="font-medium text-muted-foreground">
                                                        {formatCurrency((parseFloat(data.po_amount) || 0) / 1.12)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">VAT (12%)</span>
                                                    <span className="font-medium text-muted-foreground">
                                                        {formatCurrency(((parseFloat(data.po_amount) || 0) * 0.12) / 1.12)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={'text-sm text-muted-foreground'}>Total</span>
                                                    <p className="text-sm font-medium">{formatCurrency(data.po_amount)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Middle Section: Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter purchase order description..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>

                                {/* Project & Vendor Selection */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <ProjectSelection projects={projects} data={data} setData={setData} errors={errors} />
                                    </Suspense>

                                    <Suspense fallback={<div>Loading...</div>}>
                                        <VendorSelection vendors={vendors} data={data} setData={setData} errors={errors} />
                                    </Suspense>
                                </div>

                                {/* Financial & Timeline Information */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_term">Payment Terms</Label>
                                        <Input
                                            id="payment_term"
                                            value={data.payment_term}
                                            onChange={(e) => setData('payment_term', e.target.value)}
                                            placeholder="e.g., Net 30, Due on receipt, 2% 10 Net 30"
                                            className="w-full"
                                        />
                                        {errors.payment_term && <p className="text-sm text-red-600">{errors.payment_term}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !data.expected_delivery_date && 'text-muted-foreground',
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.expected_delivery_date
                                                        ? format(new Date(data.expected_delivery_date), 'PPP')
                                                        : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-2">
                                                <Calendar
                                                    className="w-full"
                                                    mode="single"
                                                    selected={data.expected_delivery_date ? new Date(data.expected_delivery_date) : undefined}
                                                    onSelect={(date) => setData('expected_delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.expected_delivery_date && <p className="text-sm text-red-600">{errors.expected_delivery_date}</p>}
                                    </div>
                                </div>

                                {/* Bottom Section: Save as Draft Checkbox */}
                                <div className="flex items-center space-x-2 border-t pt-4">
                                    <Checkbox id="is_draft" checked={isDraft} onCheckedChange={(checked) => handleDraft(checked)} />
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Attachments</CardTitle>
                                <CardDescription>Upload supporting documents for this purchase order</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="files">Upload Files</Label>
                                    <Input
                                        id="files"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        // accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        className="cursor-pointer"
                                    />
                                    <p className="text-sm text-muted-foreground">Maximum file size: 10MB per file</p>
                                    {errors.files && <p className="text-sm text-red-600">{errors.files}</p>}

                                    {files.length > 0 && <p className="text-sm text-green-600">{files.length} file(s) selected</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/purchase-orders">Back</Link>
                            </Button>

                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {isDraft ? 'Save as Draft' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
