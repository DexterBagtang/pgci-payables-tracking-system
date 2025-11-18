import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Building2, Check, ChevronsUpDown, FileText, User, Banknote, Badge } from 'lucide-react';
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

export default function PurchaseOrderSelection({
                                                   setBulkConfig,
                                                   selectedPO,
                                                   poOptions,
                                                   isBulkMode,
                                                   setSingleData,
                                                   errors
                                               }) {
    const [poComboboxOpen, setPoComboboxOpen] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatAmount = (amount, currency = 'PHP') => {
        const symbol = currency === 'USD' ? '$' : '₱';
        return `${symbol}${Number(amount).toLocaleString()}`;
    };

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-slate-100">
                <CardTitle className="flex items-center text-lg text-slate-800">
                    <Building2 className="mr-3 h-5 w-5 text-blue-600" />
                    Purchase Order Selection
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Select Purchase Order *
                        </Label>
                        <Popover open={poComboboxOpen} onOpenChange={setPoComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        'w-full justify-between text-left h-auto py-3 px-4 border-2 hover:border-blue-300 transition-colors',
                                        !selectedPO && 'text-slate-500 border-slate-200',
                                        selectedPO && 'border-blue-200 bg-blue-50/30'
                                    )}
                                >
                                    {selectedPO ? (
                                        <div className="flex items-start space-x-3 w-full">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-bold text-slate-800">
                                                        {selectedPO.po_number}
                                                    </span>
                                                    <span className={cn(
                                                        'px-2 py-0.5 rounded-full text-xs font-medium border',
                                                        getStatusColor(selectedPO.po_status)
                                                    )}>
                                                        {selectedPO.po_status?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600 mb-1">
                                                    <span className="font-medium">{selectedPO.vendor_name}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 truncate mb-1">
                                                    {selectedPO.project_title}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-green-700">
                                                        {formatAmount(selectedPO.po_amount, selectedPO.currency)}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        CER: {selectedPO.cer_number}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            <span>Select a purchase order...</span>
                                        </div>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[750px]  p-0 overflow-hidden">
                                <Command>
                                    <CommandInput
                                        placeholder="Search by PO number, vendor, or project..."
                                        className="border-none focus:ring-0"
                                    />
                                    <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                                        No purchase orders found.
                                    </CommandEmpty>
                                    <CommandList className="max-h-[600px] overflow-y-auto">
                                        <CommandGroup>
                                            {poOptions.map((po) => (
                                                <CommandItem
                                                    key={po.value}
                                                    value={`${po.po_number} ${po.vendor_name} ${po.project_title}`}
                                                    onSelect={() => {
                                                        if (isBulkMode) {
                                                            setBulkConfig((prev) => ({
                                                                ...prev,
                                                                sharedValues: {
                                                                    ...prev.sharedValues,
                                                                    purchase_order_id: po.value,
                                                                    currency: po.currency || 'PHP',
                                                                },
                                                            }));
                                                        } else {
                                                            setSingleData((prev) => ({
                                                                ...prev,
                                                                purchase_order_id: po.value,
                                                                currency: po.currency || 'PHP',
                                                            }));
                                                        }
                                                        setPoComboboxOpen(false);
                                                    }}
                                                    className="flex items-start space-x-3 py-3 px-3 cursor-pointer hover:bg-blue-50 transition-colors"
                                                >
                                                    <Check
                                                        className={cn(
                                                            'h-4 w-4 mt-1 flex-shrink-0',
                                                            selectedPO?.value === po.value ? 'opacity-100 text-blue-600' : 'opacity-0'
                                                        )}
                                                    />
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold text-slate-800">
                                                                {po.po_number}
                                                            </span>
                                                            <span className={cn(
                                                                'px-2 py-0.5 rounded-full text-xs font-medium border',
                                                                getStatusColor(po.po_status)
                                                            )}>
                                                                {po.po_status?.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-1">
                                                            <User className="h-3 w-3 text-slate-400" />
                                                            <span className="text-sm font-medium text-slate-700">
                                                                {po.vendor_name}
                                                            </span>
                                                        </div>

                                                        <div className="text-xs text-slate-500 line-clamp-2">
                                                            {po.project_title}
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1">
                                                            <div className="flex items-center space-x-1">
                                                                <Banknote className="h-3 w-3 text-green-600" />
                                                                <span className="text-sm font-semibold text-green-700">
                                                                    {formatAmount(po.po_amount, po.currency)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Badge className="h-3 w-3 text-slate-400" />
                                                                <span className="text-xs text-slate-500">
                                                                    CER: {po.cer_number}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.purchase_order_id && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-xs text-red-600 flex items-center">
                                    <span className="mr-1">⚠</span>
                                    {errors.purchase_order_id}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
