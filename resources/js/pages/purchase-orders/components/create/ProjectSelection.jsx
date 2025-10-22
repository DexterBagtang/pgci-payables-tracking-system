import { useEffect, useMemo, useState } from 'react';
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
import { formatCurrency } from '@/components/custom/helpers.jsx';

export default function ProjectSelection({ projects, data, setData, errors, project_id }) {
    const [projectOpen, setProjectOpen] = useState(false);

    // Reactively get selected project
    const selectedProject = useMemo(() => {
        return projects.find((p) => p.id.toString() === data.project_id?.toString());
    }, [projects, data.project_id]);

    useEffect(() => {
        if (project_id) {
            setData('project_id', project_id.toString());
        }
    }, [project_id, setData]);

    return (
        <div className="space-y-2">
            <Label htmlFor="project_id">Projects *</Label>

            <Popover open={projectOpen} onOpenChange={setProjectOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={projectOpen}
                        className="w-full justify-between truncate"
                    >
                        {selectedProject ? selectedProject.project_title : 'Select project...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search projects..." />
                        <CommandList>
                            <CommandEmpty>No project found.</CommandEmpty>
                            <CommandGroup>
                                {projects.map((project) => (
                                    <CommandItem
                                        key={project.id}
                                        value={`${project.project_title} - ${project.cer_number}`}
                                        onSelect={() => {
                                            setData('project_id', project.id.toString());
                                            setProjectOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                data.project_id?.toString() === project.id.toString()
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex flex-col">
                      <span className="font-medium">
                        {project.project_title} - {project.cer_number}
                      </span>
                                            <span className="text-xs text-muted-foreground">
                        Total: {formatCurrency(project.total_project_cost) || 'N/A'}
                      </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {errors.project_id && <p className="text-sm text-red-600">{errors.project_id}</p>}

            {selectedProject && (
                <div className="mt-2 rounded-md bg-muted p-2">
                    <p className="text-sm font-medium">{selectedProject.project_title}</p>
                    <p className="text-xs text-muted-foreground">CER: {selectedProject.cer_number}</p>
                    <p className="text-xs text-muted-foreground">
                        Total: {formatCurrency(selectedProject.total_project_cost)}
                    </p>
                </div>
            )}
        </div>
    );
}
