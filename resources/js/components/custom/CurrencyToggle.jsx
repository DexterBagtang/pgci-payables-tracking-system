import { cn } from '@/lib/utils';

export function CurrencyToggle({ value = 'PHP', onChange, className }) {
    return (
        <div className={cn("inline-flex items-center gap-0.5 ml-2", className)}>
            <button
                type="button"
                onClick={() => onChange('PHP')}
                className={cn(
                    "inline-flex items-center justify-center rounded-l-md px-2 py-0.5 text-xs font-medium transition-colors border border-input",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    value === 'PHP'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent hover:text-accent-foreground"
                )}
            >
                ₱ PHP
            </button>
            <button
                type="button"
                onClick={() => onChange('USD')}
                className={cn(
                    "inline-flex items-center justify-center rounded-r-md px-2 py-0.5 text-xs font-medium transition-colors border border-l-0 border-input",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    value === 'USD'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent hover:text-accent-foreground"
                )}
            >
                $ USD
            </button>
        </div>
    );
}
