import { Label } from '@/components/ui/label.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.js';
import { Button } from '@/components/ui/button.js';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command.js';
import { cn } from '@/lib/utils.js';
import { useState } from 'react';

export default function VendorSelection({ vendors,data,setData,errors }) {
    const [vendorOpen, setVendorOpen] = useState(false);
    const selectedVendor = vendors.find((v) => v.id == data.vendor_id);

    return (
        <div className="space-y-2">
            <Label htmlFor="vendor_id">Vendor *</Label>
            <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                <PopoverTrigger asChild className="truncate">
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={vendorOpen}
                        className="w-full justify-between"
                    >
                        {selectedVendor ? selectedVendor.name : 'Select vendor...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search vendors..." />
                        <CommandList>
                            <CommandEmpty>No vendor found.</CommandEmpty>
                            <CommandGroup>
                                {vendors.map((vendor) => (
                                    <CommandItem
                                        key={vendor.id}
                                        value={vendor.name.toString()}
                                        onSelect={() => {
                                            setData('vendor_id', vendor.id.toString());
                                            setVendorOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                data.vendor_id === vendor.id.toString() ? 'opacity-100' : 'opacity-0',
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{vendor.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                                            {vendor.category || 'General'}
                                                                        </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {errors.vendor_id && <p className="text-sm text-red-600">{errors.vendor_id}</p>}
            {selectedVendor && (
                <div className="mt-2 rounded-md bg-muted p-2">
                    <p className="text-sm font-medium">{selectedVendor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedVendor.category}</p>
                </div>
            )}
        </div>
    )
}
