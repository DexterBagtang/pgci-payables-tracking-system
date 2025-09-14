import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AddVendorDialog({ trigger, onSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [shouldAddMore, setShouldAddMore] = useState(false);
    const [showOptionalFields, setShowOptionalFields] = useState(false);

    const initialValues = {
        name: '',
        email: '',
        phone: '',
        address: '',
        category: 'SAP',
        payment_terms: '',
        notes: '',
    }

    const { data, setData, post, processing, errors,setError,resetAndClearErrors,clearErrors } = useForm(initialValues);

    const handleSubmit = (e, addMore = false) => {
        e.preventDefault()
        setShouldAddMore(addMore);

        if(!data.name?.trim()){
            setError('name','Vendor name is required!')
            return;
        }

        post('/vendors', {
            onSuccess: () => {
                toast.success('Vendor added successfully!', {
                    duration: 3000,
                    position: 'top-right',
                });

                if (addMore) {
                    setData(initialValues);
                } else {
                    setData(initialValues);
                    setIsOpen(false);
                }

                // Call parent callback if provided
                onSuccess?.();
            },
            onError: () => {
                toast.error('❌ Failed to add vendor. Please check the details and try again.', {
                    duration: 5000,
                    position: 'top-right',
                });
                setShouldAddMore(false);
            },
        });
    };

    const handleCancel = () => {
        setData(initialValues);
        setShowOptionalFields(false);
        setIsOpen(false);
    };

    useEffect(() => {
        if(!isOpen) {
            clearErrors();
        }
    },[isOpen]);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Vendor</DialogTitle>
                    <DialogDescription>
                        Fill in the vendor information below. Click "Add & Continue" to add more vendors.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                    {/* Required Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter vendor name"
                                className={errors.name ? 'border-destructive' : ''}
                                disabled={processing}
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={data.category}
                                onValueChange={(value) => setData('category', value)}
                                disabled={processing}
                            >
                                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAP">SAP</SelectItem>
                                    <SelectItem value="Manual">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowOptionalFields(!showOptionalFields)}
                        className="w-full justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        disabled={processing}
                    >
                        {showOptionalFields ? (
                            <>Hide optional fields <ChevronUp className="h-4 w-4" /></>
                        ) : (
                            <>Add more details <ChevronDown className="h-4 w-4" /></>
                        )}
                    </Button>

                    {/* Optional Fields */}
                    {showOptionalFields && (
                        <div className="space-y-4 pt-2 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="vendor@example.com"
                                    className={errors.email ? 'border-destructive' : ''}
                                    disabled={processing}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                        className={errors.phone ? 'border-destructive' : ''}
                                        disabled={processing}
                                    />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_terms">Payment Terms</Label>
                                    <Input
                                        id="payment_terms"
                                        value={data.payment_terms}
                                        onChange={(e) => setData('payment_terms', e.target.value)}
                                        placeholder="e.g., Net 30"
                                        className={errors.payment_terms ? 'border-destructive' : ''}
                                        disabled={processing}
                                    />
                                    {errors.payment_terms && <p className="text-sm text-destructive">{errors.payment_terms}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Enter vendor address"
                                    rows={2}
                                    className={errors.address ? 'border-destructive' : ''}
                                    disabled={processing}
                                />
                                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes (optional)"
                                    rows={2}
                                    disabled={processing}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit(e, true);
                            }}
                            disabled={processing}
                            className="gap-2"
                        >
                            {processing && shouldAddMore ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Add & Continue
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            {processing && !shouldAddMore ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Add Vendor
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
