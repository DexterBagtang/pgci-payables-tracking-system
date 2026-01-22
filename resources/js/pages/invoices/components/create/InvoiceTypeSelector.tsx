import { cn } from '@/lib/utils';

interface InvoiceTypeSelectorProps {
  value: 'purchase_order' | 'direct';
  onChange: (type: 'purchase_order' | 'direct') => void;
}

export function InvoiceTypeSelector({ value, onChange }: InvoiceTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 mb-6 border rounded-lg">
      <label
        className={cn(
          'flex flex-col p-4 border rounded cursor-pointer transition-colors',
          value === 'purchase_order' && 'border-primary bg-primary/5'
        )}
      >
        <input
          type="radio"
          value="purchase_order"
          checked={value === 'purchase_order'}
          onChange={() => onChange('purchase_order')}
          className="sr-only"
        />
        <span className="font-semibold">Purchase Order Invoice</span>
        <span className="text-sm text-muted-foreground">
          Invoice linked to an existing purchase order
        </span>
      </label>

      <label
        className={cn(
          'flex flex-col p-4 border rounded cursor-pointer transition-colors',
          value === 'direct' && 'border-primary bg-primary/5'
        )}
      >
        <input
          type="radio"
          value="direct"
          checked={value === 'direct'}
          onChange={() => onChange('direct')}
          className="sr-only"
        />
        <span className="font-semibold">Direct Invoice</span>
        <span className="text-sm text-muted-foreground">
          Invoice without a purchase order
        </span>
      </label>
    </div>
  );
}
