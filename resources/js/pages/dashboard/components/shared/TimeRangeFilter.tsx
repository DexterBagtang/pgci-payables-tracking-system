import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent, type DateRange } from '@/components/ui/calendar';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { TimeRange } from '@/types';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'fiscal', label: 'Fiscal Year' },
    { value: 'all', label: 'All Time' },
];

export default function TimeRangeFilter() {
    const { timeRange, setTimeRange, customDates, setCustomDates } = useDashboardFilter();
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: customDates?.start,
        to: customDates?.end,
    });

    const handleCustomDateSelect = (range: DateRange | undefined) => {
        if (!range) {
            setDateRange(undefined);
            return;
        }

        setDateRange(range);

        // Only apply when both dates are selected
        if (range.from && range.to) {
            setCustomDates({ start: range.from, end: range.to });
            setIsCustomOpen(false);
        }
    };

    const getCustomLabel = () => {
        if (!customDates) return 'Custom Range';
        return `${format(customDates.start, 'MMM dd, yyyy')} - ${format(customDates.end, 'MMM dd, yyyy')}`;
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Time Range:</span>

            {TIME_RANGES.map((range) => (
                <Button
                    key={range.value}
                    variant={timeRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                        'transition-all',
                        timeRange === range.value && 'shadow-sm'
                    )}
                >
                    {range.label}
                </Button>
            ))}

            <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={timeRange === 'custom' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            'transition-all',
                            timeRange === 'custom' && 'shadow-sm'
                        )}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        {getCustomLabel()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                        mode="range"
                        selected={dateRange}
                        onSelect={handleCustomDateSelect}
                        numberOfMonths={2}
                        initialFocus
                    />
                    <div className="p-3 border-t">
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(undefined);
                                    setCustomDates(null);
                                    setIsCustomOpen(false);
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                disabled={!dateRange?.from || !dateRange?.to}
                                onClick={() => {
                                    if (dateRange?.from && dateRange?.to) {
                                        setCustomDates({ start: dateRange.from, end: dateRange.to });
                                        setIsCustomOpen(false);
                                    }
                                }}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
