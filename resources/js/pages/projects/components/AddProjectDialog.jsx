import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { formatNumberWithCommas, parseFormattedNumber } from '@/components/custom/helpers.jsx';

export default function AddProjectDialog({ open, onOpenChange, project = null }) {
    const isEditing = !!project;
    const [displayCosts, setDisplayCosts] = useState({
        total_project_cost: '',
        total_contract_cost: '',
    });
    const [contractCostManuallyEdited, setContractCostManuallyEdited] = useState(false);

    const initialValues = {
        project_title: project?.project_title || '',
        cer_number: project?.cer_number || '',
        total_project_cost: project?.total_project_cost || '',
        total_contract_cost: project?.total_contract_cost || '',
        project_type: project?.project_type || '',
        smpo_number: project?.smpo_number || '',
        philcom_category: project?.philcom_category || '',
        team: project?.team || '',
        description: project?.description || '',
    };

    const { data, setData, post, put, processing, errors, setError, reset, clearErrors } = useForm(initialValues);

    // Initialize display costs when component mounts or project changes
    useEffect(() => {
        if (project) {
            setDisplayCosts({
                total_project_cost: formatNumberWithCommas(project.total_project_cost),
                total_contract_cost: formatNumberWithCommas(project.total_contract_cost)
            });
            setContractCostManuallyEdited(false);
        } else {
            setDisplayCosts({ total_project_cost: '', total_contract_cost: '' });
            setContractCostManuallyEdited(false);
        }
    }, [project]);

    // Auto-populate Total Contract Cost from Total Project Cost
    useEffect(() => {
        // Only auto-populate if the user hasn't manually edited the contract cost
        if (!contractCostManuallyEdited && data.total_project_cost) {
            setDisplayCosts((prev) => ({
                ...prev,
                total_contract_cost: displayCosts.total_project_cost
            }));
            setData('total_contract_cost', data.total_project_cost);
        }
    }, [data.total_project_cost, displayCosts.total_project_cost, contractCostManuallyEdited]);

    const validateForm = () => {
        let isValid = true;

        // Clear previous client-side errors
        clearErrors();

        // Project Title validation
        if (!data.project_title || data.project_title.trim() === '') {
            setError('project_title', 'Project Title is required');
            isValid = false;
        }

        // CER Number validation
        if (!data.cer_number || data.cer_number.trim() === '') {
            setError('cer_number', 'CER Number is required');
            isValid = false;
        }

        // Total Project Cost validation
        if (!data.total_project_cost || data.total_project_cost === '') {
            setError('total_project_cost', 'Total Project Cost is required');
            isValid = false;
        } else {
            const numericValue = parseFloat(parseFormattedNumber(data.total_project_cost));
            if (isNaN(numericValue) || numericValue <= 0) {
                setError('total_project_cost', 'Total Project Cost must be a valid positive number');
                isValid = false;
            }
        }

        // Project Type validation
        if (!data.project_type || data.project_type === '') {
            setError('project_type', 'Project Type is required');
            isValid = false;
        }

        // Total Contract Cost validation (required for SM projects only)
        if (data.project_type === 'sm_project') {
            if (!data.total_contract_cost || data.total_contract_cost === '') {
                setError('total_contract_cost', 'Total Contract Cost is required');
                isValid = false;
            } else {
                const numericValue = parseFloat(parseFormattedNumber(data.total_contract_cost));
                if (isNaN(numericValue) || numericValue <= 0) {
                    setError('total_contract_cost', 'Total Contract Cost must be a valid positive number');
                    isValid = false;
                }
            }
        }

        // Conditional validation based on project type
        if (data.project_type === 'sm_project') {
            if (!data.smpo_number || data.smpo_number.trim() === '') {
                setError('smpo_number', 'SMPO Number is required for SM Projects');
                isValid = false;
            }
        }

        if (data.project_type === 'philcom_project') {
            if (!data.philcom_category || data.philcom_category === '') {
                setError('philcom_category', 'Philcom Category is required for Philcom Projects');
                isValid = false;
            }
            if (!data.team || data.team === '') {
                setError('team', 'Philcom team is required for Philcom Projects');
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

        const submitFunction = isEditing ? put : post;
        const url = isEditing ? `/projects/${project.id}` : '/projects';
        const successMessage = isEditing ? 'Project Updated Successfully.' : 'Project Added Successfully.';

        submitFunction(url, {
            onSuccess: () => {
                reset();
                setDisplayCosts({ total_project_cost: '', total_contract_cost: '' });
                setContractCostManuallyEdited(false);
                onOpenChange(false);
                project = null
            },
            onError: () => {
                // Errors are automatically handled by Inertia
            },
        });
    }

    const handleProjectTypeChange = (value) => {
        setData((prevData) => ({
            ...prevData,
            project_type: value,
            smpo_number: value === 'sm_project' ? prevData.smpo_number : '', // Keep existing value for SM, reset for others
            philcom_category: value === 'philcom_project' ? prevData.philcom_category : '', // Keep existing value for Philcom, reset for others
            team: value === 'philcom_project' ? prevData.team : '', // Keep existing value for Philcom, reset for others
        }));

        // Clear related errors when project type changes
        if (errors.smpo_number) clearErrors('smpo_number');
        if (errors.philcom_category) clearErrors('philcom_category');
        if (errors.team) clearErrors('team');
    };

    const handleOpenChange = (newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            if (isEditing) {
                // Reset to original project values when closing edit dialog
                reset();
                setDisplayCosts({
                    total_project_cost: formatNumberWithCommas(project?.total_project_cost || ''),
                    total_contract_cost: formatNumberWithCommas(project?.total_contract_cost || '')
                });
            } else {
                // Clear form for add dialog
                reset();
                setDisplayCosts({ total_project_cost: '', total_contract_cost: '' });
            }
            setContractCostManuallyEdited(false);
            clearErrors();
        }
    };

    useEffect(() => {
        if (!open) {
            clearErrors();
        }
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? 'Edit Project' : 'Add New Project'}</SheetTitle>
                    <SheetDescription>
                        {isEditing ? 'Update the project details below.' : 'Provide all the details of the new project.'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6 px-4 py-6">
                    {/* Project Title */}
                    <div className="space-y-2">
                        <Label htmlFor="project_title">
                            Project Title <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
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
                        {errors.project_title && <p className="text-sm text-destructive">{errors.project_title}</p>}
                    </div>

                    {/* Project Type */}
                    <div className="space-y-2">
                        <Label htmlFor="project_type">
                            Project Type <span className="text-destructive">*</span>
                        </Label>
                        <Select value={data.project_type} onValueChange={handleProjectTypeChange} disabled={processing}>
                            <SelectTrigger className={errors.project_type ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sm_project">SM Project</SelectItem>
                                <SelectItem value="philcom_project">Philcom Project</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.project_type && <p className="text-sm text-destructive">{errors.project_type}</p>}
                    </div>

                    {/* CER Number */}
                    <div className="space-y-2">
                        <Label htmlFor="cer_number">
                            CER Number <span className="text-destructive">*</span>
                        </Label>
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
                        {errors.cer_number && <p className="text-sm text-destructive">{errors.cer_number}</p>}
                    </div>

                    {/* Total Project Cost */}
                    <div className="space-y-2">
                        <Label htmlFor="total_project_cost">
                            Total Project Cost <span className="text-destructive">*</span>
                        </Label>
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
                                setDisplayCosts((prev) => ({ ...prev, total_project_cost: formattedValue }));

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
                        {errors.total_project_cost && <p className="text-sm text-destructive">{errors.total_project_cost}</p>}
                    </div>

                    {/* Total Contract Cost - show for editing or SM projects */}
                    {(isEditing || data.project_type === 'sm_project') && (
                        <div className="space-y-2">
                            <Label htmlFor="total_contract_cost">
                                Total Contract Cost <span className="text-destructive">*</span>
                            </Label>
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
                                    setDisplayCosts((prev) => ({ ...prev, total_contract_cost: formattedValue }));

                                    // Store the raw numeric value for form submission
                                    const numericValue = parseFormattedNumber(formattedValue);
                                    setData('total_contract_cost', numericValue);

                                    // Mark as manually edited to prevent auto-population
                                    setContractCostManuallyEdited(true);

                                    // Clear error when user starts typing
                                    if (errors.total_contract_cost) clearErrors('total_contract_cost');
                                }}
                                placeholder="Enter total contract cost (e.g., 1,000,000.00)"
                                className={errors.total_contract_cost ? 'border-destructive' : ''}
                                disabled={processing}
                            />
                            {errors.total_contract_cost && <p className="text-sm text-destructive">{errors.total_contract_cost}</p>}
                        </div>
                    )}

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
                            {errors.smpo_number && <p className="text-sm text-destructive">{errors.smpo_number}</p>}
                        </div>
                    )}

                    {data.project_type === 'philcom_project' && (
                        <>
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
                                {errors.philcom_category && <p className="text-sm text-destructive">{errors.philcom_category}</p>}
                            </div>

                            {/* Team */}
                            <div className="space-y-2">
                                <Label htmlFor="team">
                                    Team <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="team"
                                    value={data.team}
                                    onChange={(e) => {
                                        setData('team', e.target.value);
                                        // Clear error when user starts typing
                                        if (errors.team) clearErrors('team');
                                    }}
                                    placeholder="Enter team that handles this project"
                                    className={errors.team ? 'border-destructive' : ''}
                                    disabled={processing}
                                />
                                {errors.team && <p className="text-sm text-destructive">{errors.team}</p>}
                            </div>
                        </>
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
                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>
                </form>

                <SheetFooter className="gap-2">
                    <SheetClose asChild>
                        <Button variant="outline" disabled={processing}>
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button onClick={handleSubmit} disabled={processing} className="min-w-[100px]">
                        {processing ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Project' : 'Submit')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
