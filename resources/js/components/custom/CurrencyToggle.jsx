import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CurrencyToggle({ value = 'PHP', onChange, className }) {
    return (
        <div className={cn("inline-flex rounded-md border border-input bg-background", className)}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('PHP')}
                className={cn(
                    "rounded-r-none border-r px-3 py-1 h-7 text-xs font-medium transition-colors",
                    value === 'PHP'
                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                )}
            >
                ₱ PHP
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('USD')}
                className={cn(
                    "rounded-l-none px-3 py-1 h-7 text-xs font-medium transition-colors",
                    value === 'USD'
                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                )}
            >
                $ USD
            </Button>
        </div>
    );
}
