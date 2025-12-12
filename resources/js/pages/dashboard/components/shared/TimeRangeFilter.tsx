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
        setDateRange(range);
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
                <PopoverContent className="w-auto" align="start">
                    <div className="space-y-4">
                        <div>
                            <CalendarComponent
                                mode="range"
                                selected={dateRange}
                                onSelect={handleCustomDateSelect}
                                numberOfMonths={2}
                                captionLayout="dropdown"
                                fromYear={2020}
                                toYear={2030}
                                disableNavigation
                                className="rounded-md border w-auto"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setDateRange(undefined);
                                    setCustomDates(null);
                                    setIsCustomOpen(false);
                                    if (timeRange === 'custom') {
                                        setTimeRange('all');
                                    }
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    if (dateRange?.from && dateRange?.to) {
                                        setCustomDates({ start: dateRange.from, end: dateRange.to });
                                        setTimeRange('custom');
                                        setIsCustomOpen(false);
                                    }
                                }}
                                disabled={!dateRange?.from || !dateRange?.to}
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
