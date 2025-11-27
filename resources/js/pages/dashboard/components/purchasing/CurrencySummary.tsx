import { DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CurrencySummaryData {
    php_count: number;
    php_total: number;
    usd_count: number;
    usd_total: number;
}

interface CurrencySummaryProps {
    data: CurrencySummaryData;
}

export default function CurrencySummary({ data }: CurrencySummaryProps) {
    const formatCurrency = (value: number, currency: 'PHP' | 'USD') => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const currencies = [
        {
            label: 'PHP',
            count: data.php_count,
            total: data.php_total,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            label: 'USD',
            count: data.usd_count,
            total: data.usd_total,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {currencies.map((currency) => (
                <Card key={currency.label} className={cn('p-3', currency.bgColor)}>
                    <div className="flex items-start gap-2">
                        <DollarSign className={cn('h-4 w-4 mt-0.5', currency.color)} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1">
                                <p className={cn('text-xs font-medium', currency.color)}>
                                    {currency.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    ({currency.count} PO{currency.count !== 1 ? 's' : ''})
                                </p>
                            </div>
                            <p className={cn('text-base font-semibold truncate', currency.color)}>
                                {formatCurrency(currency.total, currency.label as 'PHP' | 'USD')}
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
