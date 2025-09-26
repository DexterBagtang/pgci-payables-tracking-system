import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.js';
import { Button } from '@/components/ui/button.js';
import { cn } from '@/lib/utils.js';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command.js';
import { useState } from 'react';

export default function PurchaseOrderSelection(
    {
        setBulkConfig,
        selectedPO,
        poOptions,
        isBulkMode,
        setSingleData,
        errors
    }
) {
    const [poComboboxOpen, setPoComboboxOpen] = useState(false);

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                    Purchase Order
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <Label className="text-sm font-medium">Purchase Order *</Label>
                    <Popover open={poComboboxOpen} onOpenChange={setPoComboboxOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn('mt-1 w-full justify-between text-left', !selectedPO && 'text-slate-500')}
                            >
                                {selectedPO ? (
                                    <div className="flex flex-col items-start py-1">
                                        <div className="text-sm font-medium">{selectedPO.po_number}</div>
                                        <div className="truncate text-xs text-slate-600">
                                            {selectedPO.vendor_name} • ₱{Number(selectedPO.po_amount).toLocaleString()}
                                        </div>
                                    </div>
                                ) : (
                                    'Select purchase order...'
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search purchase orders..." />
                                <CommandEmpty>No purchase order found.</CommandEmpty>
                                <CommandList>
                                    <CommandGroup>
                                        {poOptions.map((po) => (
                                            <CommandItem
                                                key={po.value}
                                                value={po.label}
                                                onSelect={() => {
                                                    if (isBulkMode) {
                                                        setBulkConfig((prev) => ({
                                                            ...prev,
                                                            sharedValues: {
                                                                ...prev.sharedValues,
                                                                purchase_order_id: po.value,
                                                            },
                                                        }));
                                                    } else {
                                                        setSingleData((prev) => ({
                                                            ...prev,
                                                            purchase_order_id: po.value,
                                                        }));
                                                    }
                                                    setPoComboboxOpen(false);
                                                }}
                                                className="flex flex-col items-start py-2"
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        selectedPO?.value === po.value ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium">{po.po_number}</div>
                                                    <div className="text-xs text-slate-600">{po.vendor_name}</div>
                                                    <div className="text-xs text-slate-500">
                                                        ₱{Number(po.po_amount).toLocaleString()}
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {errors.purchase_order_id && <p className="mt-1 text-xs text-red-600">{errors.purchase_order_id}</p>}
                </div>
            </CardContent>
        </Card>
    )
}
