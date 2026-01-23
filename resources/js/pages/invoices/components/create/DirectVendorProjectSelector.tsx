import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Vendor {
  id: number;
  name: string;
  category?: string;
}

interface DirectVendorProjectSelectorProps {
  vendors: Vendor[];
  selectedVendorId: string;
  onVendorChange: (vendorId: string) => void;
}

function RequiredLabel() {
  return <span className="text-red-500">*</span>;
}

export function DirectVendorProjectSelector({
  vendors,
  selectedVendorId,
  onVendorChange,
}: DirectVendorProjectSelectorProps) {
  return (
    <div>
      {/* Vendor Selector */}
      <Label>
        Vendor <RequiredLabel />
      </Label>
      <Select value={selectedVendorId} onValueChange={onVendorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select vendor..." />
        </SelectTrigger>
        <SelectContent>
          {vendors.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id.toString()}>
              {vendor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
