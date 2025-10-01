import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

export function DatePicker({
                               label,
                               value,
                               onChange,
                               error,
                               placeholder = 'Select date',
                               required = false,
                               disabled = false,
                               className = '',
                               size = 'default', // 'default' | 'sm'
                               captionLayout = 'dropdown', // 'buttons' | 'dropdown'
                           }) {
    const buttonHeight = size === 'sm' ? 'h-8' : 'h-9';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    const labelSize = size === 'sm' ? 'text-xs' : 'text-sm';

    const [open, setOpen] = useState(false);

    const handleSelect = (date) => {
        onChange(date);
        setOpen(false); // Close the popover after selection
    };

    return (
        <div className={className}>
            {label && (
                <Label className={cn('font-medium', labelSize)}>
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            buttonHeight,
                            textSize,
                            !value && 'text-slate-500',
                            label && 'mt-1',
                            // error && 'border-red-500'
                        )}
                    >
                        <CalendarIcon className={cn('mr-2', iconSize)} />
                        {value ? format(new Date(value), size === 'sm' ? 'MMM d, yyyy' : 'PPP') : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={handleSelect}
                        captionLayout={captionLayout}
                        disabled={disabled}
                        className='w-56 align-middle'

                    />
                </PopoverContent>
            </Popover>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
