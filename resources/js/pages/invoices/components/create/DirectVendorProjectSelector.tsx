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

interface Project {
  id: number;
  project_title: string;
  cer_number: string;
}

interface DirectVendorProjectSelectorProps {
  vendors: Vendor[];
  projects: Project[];
  selectedVendorId: string;
  selectedProjectId: string;
  onVendorChange: (vendorId: string) => void;
  onProjectChange: (projectId: string) => void;
}

function RequiredLabel() {
  return <span className="text-red-500">*</span>;
}

export function DirectVendorProjectSelector({
  vendors,
  projects,
  selectedVendorId,
  selectedProjectId,
  onVendorChange,
  onProjectChange,
}: DirectVendorProjectSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Vendor Selector */}
      <div>
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

      {/* Project Selector */}
      <div>
        <Label>
          Project <RequiredLabel />
        </Label>
        <Select value={selectedProjectId} onValueChange={onProjectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id.toString()}>
                {project.project_title} ({project.cer_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
