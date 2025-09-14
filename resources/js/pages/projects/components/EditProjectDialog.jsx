import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Form, useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Helper function to format number with commas
const formatNumberWithCommas = (value) => {
    if (!value) return '';
    // Remove any existing commas and non-numeric characters except decimal point
    const numericValue = value.toString().replace(/[^\d.]/g, '');
    // Split by decimal point
    const parts = numericValue.split('.');
    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Join back with decimal if it exists
    return parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
};

// Helper function to parse formatted number back to numeric value
const parseFormattedNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
};

export default function EditProjectDialog({ open, setOpen, project }) {
    const [displayCosts, setDisplayCosts] = useState({
        total_project_cost: '',
        total_contract_cost: ''
    });

    const initialValues = {
        project_title: project?.project_title || '',
        cer_number: project?.cer_number || '',
        total_project_cost: project?.total_project_cost || '',
        total_contract_cost: project?.total_contract_cost || '',
        project_type: project?.project_type || '',
        smpo_number: project?.smpo_number || '',
        philcom_category: project?.philcom_category || '',
        description: project?.description || '',
    }

    const { data, setData, put, processing, errors, setError, reset, clearErrors } = useForm(initialValues);

    // Initialize display costs when component mounts or project changes
    useEffect(() => {
        if (project) {
            setDisplayCosts({
                total_project_cost: formatNumberWithCommas(project.total_project_cost),
                total_contract_cost: formatNumberWithCommas(project.total_contract_cost)
            });
        }
    }, [project]);

    // Client-side validation function
    const validateForm = () => {
        let isValid = true;

        // Clear previous client-side errors
        clearErrors();

        // Project Title validation
        if (!data.project_title || data.project_title.trim() === '') {
            setError('project_title', "Project Title is required");
            isValid = false;
        }

        // CER Number validation
        if (!data.cer_number || data.cer_number.trim() === '') {
            setError('cer_number', "CER Number is required");
            isValid = false;
        }

        // Total Project Cost validation
        if (!data.total_project_cost || data.total_project_cost === '') {
            setError('total_project_cost', "Total Project Cost is required");
            isValid = false;
        } else {
            const numericValue = parseFloat(parseFormattedNumber(data.total_project_cost));
            if (isNaN(numericValue) || numericValue <= 0) {
                setError('total_project_cost', "Total Project Cost must be a valid positive number");
                isValid = false;
            }
        }

        // Total Contract Cost validation
        if (!data.total_contract_cost || data.total_contract_cost === '') {
            setError('total_contract_cost', "Total Contract Cost is required");
            isValid = false;
        } else {
            const numericValue = parseFloat(parseFormattedNumber(data.total_contract_cost));
            if (isNaN(numericValue) || numericValue <= 0) {
                setError('total_contract_cost', "Total Contract Cost must be a valid positive number");
                isValid = false;
            }
        }

        // Project Type validation
        if (!data.project_type || data.project_type === '') {
            setError('project_type', "Project Type is required");
            isValid = false;
        }

        // Conditional validation based on project type
        if (data.project_type === 'sm_project') {
            if (!data.smpo_number || data.smpo_number.trim() === '') {
                setError('smpo_number', "SMPO Number is required for SM Projects");
                isValid = false;
            }
        }

        if (data.project_type === 'philcom_project') {
            if (!data.philcom_category || data.philcom_category === '') {
                setError('philcom_category', "Philcom Category is required for Philcom Projects");
                isValid = false;
            }
        }

        return isValid;
    };

    function handleSubmit(e) {
        e.preventDefault();

        // Run client-side validation
        if (!validateForm()) {
            return;
        }

        put(`/projects/${project.id}`, {
            onSuccess: () => {
                setOpen(false);
                toast.success('Project Successfully Updated');
            },
            onError: (errors) => {
                toast.error('Project Error Updating Project');
                console.log(errors);
                // Errors are automatically handled by Inertia
            }
        });
    }

    const handleProjectTypeChange = (value) => {
        setData(prevData => ({
            ...prevData,
            project_type: value,
            smpo_number: value === 'sm_project' ? prevData.smpo_number : '', // Keep existing value for SM, reset for others
            philcom_category: value === 'philcom_project' ? prevData.philcom_category : '' // Keep existing value for Philcom, reset for others
        }));

        // Clear related errors when project type changes
        if (errors.smpo_number) clearErrors('smpo_number');
        if (errors.philcom_category) clearErrors('philcom_category');
    };

    // Reset form when dialog closes
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset to original project values
            reset();
            setDisplayCosts({
                total_project_cost: formatNumberWithCommas(project?.total_project_cost || ''),
                total_contract_cost: formatNumberWithCommas(project?.total_contract_cost || '')
            });
            clearErrors();
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Project</SheetTitle>
                    <SheetDescription>
                        Update the project details below.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
                    {/* Project Title */}
                    <div className="space-y-2">
                        <Label htmlFor="project_title">
                            Project Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="project_title"
                            value={data.project_title}
                            onChange={(e) => {
                                setData('project_title', e.target.value);
                                // Clear error when user starts typing
                                if (errors.project_title) clearErrors('project_title');
                            }}
                            placeholder="Enter project title"
                            className={errors.project_title ? 'border-destructive' : ''}
                            disabled={processing}
                            required
                        />
                        {errors.project_title && (
                            <p className="text-sm text-destructive">{errors.project_title}</p>
                        )}
                    </div>

                    {/* CER Number */}
                    <div className="space-y-2">
                        <Label htmlFor="cer_number">CER Number <span className="text-destructive">*</span></Label>
                        <Input
                            id="cer_number"
                            value={data.cer_number}
                            onChange={(e) => {
                                setData('cer_number', e.target.value);
                                // Clear error when user starts typing
                                if (errors.cer_number) clearErrors('cer_number');
                            }}
                            placeholder="Enter CER number"
                            className={errors.cer_number ? 'border-destructive' : ''}
                            disabled={processing}
                        />
                        {errors.cer_number && (
                            <p className="text-sm text-destructive">{errors.cer_number}</p>
                        )}
                    </div>

                    {/* Total Project Cost */}
                    <div className="space-y-2">
                        <Label htmlFor="total_project_cost">Total Project Cost <span className="text-destructive">*</span></Label>
                        <Input
                            id="total_project_cost"
                            type="text"
                            value={displayCosts.total_project_cost}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                // Allow only numbers, decimal point, and commas
                                const cleanValue = inputValue.replace(/[^\d.,]/g, '');

                                // Format the display value
                                const formattedValue = formatNumberWithCommas(cleanValue);
                                setDisplayCosts(prev => ({ ...prev, total_project_cost: formattedValue }));

                                // Store the raw numeric value for form submission
                                const numericValue = parseFormattedNumber(formattedValue);
                                setData('total_project_cost', numericValue);

                                // Clear error when user starts typing
                                if (errors.total_project_cost) clearErrors('total_project_cost');
                            }}
                            placeholder="Enter total project cost (e.g., 1,000,000.00)"
                            className={errors.total_project_cost ? 'border-destructive' : ''}
                            disabled={processing}
                        />
                        {errors.total_project_cost && (
                            <p className="text-sm text-destructive">{errors.total_project_cost}</p>
                        )}
                    </div>

                    {/* Total Contract Cost */}
                    <div className="space-y-2">
                        <Label htmlFor="total_contract_cost">Total Contract Cost <span className="text-destructive">*</span></Label>
                        <Input
                            id="total_contract_cost"
                            type="text"
                            value={displayCosts.total_contract_cost}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                // Allow only numbers, decimal point, and commas
                                const cleanValue = inputValue.replace(/[^\d.,]/g, '');

                                // Format the display value
                                const formattedValue = formatNumberWithCommas(cleanValue);
                                setDisplayCosts(prev => ({ ...prev, total_contract_cost: formattedValue }));

                                // Store the raw numeric value for form submission
                                const numericValue = parseFormattedNumber(formattedValue);
                                setData('total_contract_cost', numericValue);

                                // Clear error when user starts typing
                                if (errors.total_contract_cost) clearErrors('total_contract_cost');
                            }}
                            placeholder="Enter total contract cost (e.g., 1,000,000.00)"
                            className={errors.total_contract_cost ? 'border-destructive' : ''}
                            disabled={processing}
                        />
                        {errors.total_contract_cost && (
                            <p className="text-sm text-destructive">{errors.total_contract_cost}</p>
                        )}
                    </div>

                    {/* Project Type */}
                    <div className="space-y-2">
                        <Label htmlFor="project_type">
                            Project Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.project_type}
                            onValueChange={handleProjectTypeChange}
                            disabled={processing}
                        >
                            <SelectTrigger className={errors.project_type ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sm_project">SM Project</SelectItem>
                                <SelectItem value="philcom_project">Philcom Project</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.project_type && (
                            <p className="text-sm text-destructive">{errors.project_type}</p>
                        )}
                    </div>

                    {/* Conditional Fields based on Project Type */}
                    {data.project_type === 'sm_project' && (
                        <div className="space-y-2">
                            <Label htmlFor="smpo_number">
                                SMPO Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="smpo_number"
                                value={data.smpo_number}
                                onChange={(e) => {
                                    setData('smpo_number', e.target.value);
                                    // Clear error when user starts typing
                                    if (errors.smpo_number) clearErrors('smpo_number');
                                }}
                                placeholder="Enter SMPO number"
                                className={errors.smpo_number ? 'border-destructive' : ''}
                                disabled={processing}
                                required
                            />
                            {errors.smpo_number && (
                                <p className="text-sm text-destructive">{errors.smpo_number}</p>
                            )}
                        </div>
                    )}

                    {data.project_type === 'philcom_project' && (
                        <div className="space-y-2">
                            <Label htmlFor="philcom_category">
                                Philcom Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.philcom_category}
                                onValueChange={(value) => {
                                    setData('philcom_category', value);
                                    // Clear error when user selects a value
                                    if (errors.philcom_category) clearErrors('philcom_category');
                                }}
                                disabled={processing}
                            >
                                <SelectTrigger className={errors.philcom_category ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select philcom category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="profit_and_loss">Profit and Loss</SelectItem>
                                    <SelectItem value="capital_expenditure">Capital Expenditure</SelectItem>
                                    <SelectItem value="others">Others</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.philcom_category && (
                                <p className="text-sm text-destructive">{errors.philcom_category}</p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter project description"
                            className={errors.description ? 'border-destructive' : ''}
                            disabled={processing}
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                </form>

                <SheetFooter className="gap-2">
                    <SheetClose asChild>
                        <Button variant="outline" disabled={processing}>
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="min-w-[100px]"
                    >
                        {processing ? 'Updating...' : 'Update Project'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
