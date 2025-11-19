import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function PaymentTermsSelect({
    value,
    onChange,
    otherValue,
    onOtherChange,
    error,
    otherError,
    paymentTermsOptions,
    required = false,
    size = 'default', // 'default' | 'sm'
    className = '',
    label = 'Terms',
}) {
    const triggerHeight = size === 'sm' ? 'h-8' : 'h-9';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
    const labelSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <div className={className}>
            <div className={value === 'others' ? 'flex gap-2' : ''}>
                <div className={cn('space-y-1', value === 'others' ? 'flex-[1]' : 'flex-1')}>
                    {label && (
                        <Label className={cn('font-medium', labelSize)}>
                            {label}
                            {required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                    )}
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className={cn(triggerHeight, textSize, label && 'mt-1', error && 'border-red-500')}>
                            <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentTermsOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className={textSize}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </div>

                {value === 'others' && (
                    <div className="flex-[3] space-y-1">
                        {label && (
                            <Label className={cn('font-medium', labelSize)}>Specify {required && <span className="ml-1 text-red-500">*</span>}</Label>
                        )}
                        <Input
                            value={otherValue || ''}
                            onChange={(e) => onOtherChange(e.target.value)}
                            placeholder="Enter payment term"
                            className={cn(triggerHeight, textSize, label && 'mt-1', otherError && 'border-red-500')}
                        />
                        {otherError && <p className="mt-1 text-xs text-red-600">{otherError}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
