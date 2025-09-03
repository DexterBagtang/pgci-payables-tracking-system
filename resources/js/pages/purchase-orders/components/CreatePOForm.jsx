import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.js";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Label } from "@/components/ui/label.js";
import { Textarea } from "@/components/ui/textarea.js";
import { Badge } from "@/components/ui/badge.js";
import { Checkbox } from "@/components/ui/checkbox.js";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command.js";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.js";
import {
    ArrowLeft,
    Save,
    Send,
    Search,
    DollarSign,
    Building,
    FileText,
    Clock,
    Check,
    ChevronsUpDown,
} from 'lucide-react';
import { cn } from "@/lib/utils.js";
import { toast } from 'sonner';
// Replace the Calendar import from lucide-react
import { Calendar as CalendarIcon } from 'lucide-react';
// Add these new imports
import { Calendar } from "@/components/ui/calendar.js";
import { format } from "date-fns";

export default function CreatePOForm({ vendors, projects }) {
    const [isDraft, setIsDraft] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);
    const [vendorOpen, setVendorOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        po_number: '',
        project_id: '',
        vendor_id: '',
        po_amount: '',
        payment_term: '',
        // po_date: new Date().toISOString().split('T')[0],
        po_date: '',
        expected_delivery_date: '',
        description: '',
        po_status: 'open',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/purchase-orders', {
            onSuccess: () => {
                toast.success('PO added successfully.');
                reset();
            },
        });
    };

    const selectedProject = projects.find(p => p.id == data.project_id);
    const selectedVendor = vendors.find(v => v.id == data.vendor_id);

    const paymentTermOptions = [
        '15 Days',
        '30 Days',
        '45 Days',
        '60 Days',
        'COD',
        'Advance Payment',
        'Upon Delivery'
    ];

    const formatCurrency = (amount) => {
        if (!amount) return '';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
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
                        <div className="flex items-center gap-4 mb-4">
                            <Button variant="outline" asChild>
                                <Link href="/purchase-orders">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Purchase Orders
                                </Link>
                            </Button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Create New Purchase Order</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Fill out the form below to create a new purchase order
                            </p>
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
                                <CardDescription>
                                    Enter all the details for the purchase order
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Top Section: PO Number, Date, Amount */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="po_number">PO Number</Label>
                                        <Input
                                            id="po_number"
                                            value={data.po_number}
                                            onChange={(e) => setData('po_number', e.target.value)}
                                            placeholder="e.g., PO-2024-001"
                                            error={errors.po_number}
                                        />
                                        {errors.po_number && (
                                            <p className="text-sm text-red-600">{errors.po_number}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="po_date">PO Date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.po_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.po_date ? format(new Date(data.po_date), "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0">
                                                <Calendar
                                                    className="w-full"
                                                    mode="single"
                                                    selected={data.po_date ? new Date(data.po_date) : undefined}
                                                    onSelect={(date) => setData('po_date', date ? format(date, "yyyy-MM-dd") : '')}
                                                    captionLayout={"dropdown"}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.po_date && (
                                            <p className="text-sm text-red-600">{errors.po_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="po_amount">PO Amount *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                                            <Input
                                                id="po_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.po_amount}
                                                onChange={(e) => setData('po_amount', e.target.value)}
                                                className="pl-8"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.po_amount && (
                                            <p className="text-sm text-red-600">{errors.po_amount}</p>
                                        )}
                                        {data.po_amount && (
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(data.po_amount)}
                                            </p>
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
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Project & Vendor Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="project_id">Project *</Label>
                                        <Popover open={projectOpen} onOpenChange={setProjectOpen}>
                                            <PopoverTrigger className="truncate" asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={projectOpen}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedProject
                                                        ? selectedProject.project_title
                                                        : "Select project..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search projects..." />
                                                    <CommandList>
                                                        <CommandEmpty>No project found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {projects.map((project) => (
                                                                <CommandItem
                                                                    key={project.id}
                                                                    value={project.id.toString()}
                                                                    onSelect={() => {
                                                                        setData('project_id', project.id.toString());
                                                                        setProjectOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            data.project_id === project.id.toString() ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{project.project_title}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            CER: {project.cer_number || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.project_id && (
                                            <p className="text-sm text-red-600">{errors.project_id}</p>
                                        )}
                                        {selectedProject && (
                                            <div className="p-2 bg-muted rounded-md mt-2">
                                                <p className="text-sm font-medium">{selectedProject.project_title}</p>
                                                <p className="text-xs text-muted-foreground">CER: {selectedProject.cer_number}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="vendor_id">Vendor *</Label>
                                        <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                                            <PopoverTrigger asChild className="truncate">
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={vendorOpen}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedVendor
                                                        ? selectedVendor.name
                                                        : "Select vendor..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search vendors..." />
                                                    <CommandList>
                                                        <CommandEmpty>No vendor found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {vendors.map((vendor) => (
                                                                <CommandItem
                                                                    key={vendor.id}
                                                                    value={vendor.id.toString()}
                                                                    onSelect={() => {
                                                                        setData('vendor_id', vendor.id.toString());
                                                                        setVendorOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            data.vendor_id === vendor.id.toString() ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{vendor.name}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {vendor.category || 'General'}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.vendor_id && (
                                            <p className="text-sm text-red-600">{errors.vendor_id}</p>
                                        )}
                                        {selectedVendor && (
                                            <div className="p-2 bg-muted rounded-md mt-2">
                                                <p className="text-sm font-medium">{selectedVendor.name}</p>
                                                <p className="text-xs text-muted-foreground">{selectedVendor.category}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Financial & Timeline Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_term">Payment Terms</Label>
                                        <Select
                                            value={data.payment_term}
                                            onValueChange={(value) => setData('payment_term', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment terms" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentTermOptions.map((term) => (
                                                    <SelectItem key={term} value={term}>
                                                        {term}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_term && (
                                            <p className="text-sm text-red-600">{errors.payment_term}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.expected_delivery_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.expected_delivery_date ? format(new Date(data.expected_delivery_date), "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-2">
                                                <Calendar
                                                    className=" w-full"
                                                    mode="single"
                                                    selected={data.expected_delivery_date ? new Date(data.expected_delivery_date) : undefined}
                                                    onSelect={(date) => setData('expected_delivery_date', date ? format(date, "yyyy-MM-dd") : '')}
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.expected_delivery_date && (
                                            <p className="text-sm text-red-600">{errors.expected_delivery_date}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Section: Save as Draft Checkbox */}
                                <div className="flex items-center space-x-2 pt-4 border-t">
                                    <Checkbox
                                        id="is_draft"
                                        checked={isDraft}
                                        onCheckedChange={(checked) => handleDraft(checked)}
                                    />
                                    <Label htmlFor="is_draft" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Save as Draft
                                    </Label>
                                    {isDraft ? (
                                        <Badge variant="secondary" className="ml-2">Draft</Badge>
                                    ) : (
                                        <Badge variant="default" className="ml-2">Open</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/purchase-orders">Cancel</Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isDraft ? 'Save as Draft' : 'Create & Send'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
