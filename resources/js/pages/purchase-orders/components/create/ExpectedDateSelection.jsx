import { Label } from '@/components/ui/label.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.js';
import { Button } from '@/components/ui/button.js';
import { cn } from '@/lib/utils.js';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar.js';

export default function ExpectedDateSelectionButton({data,setData,errors}){
    return (
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
    )
}
