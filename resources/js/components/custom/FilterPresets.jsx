import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Star, Save, Trash2, Settings } from 'lucide-react';

export default function FilterPresets({ storageKey, currentFilters, onApplyPreset }) {
    const [presets, setPresets] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [presetName, setPresetName] = useState('');

    const savePreset = () => {
        if (!presetName.trim()) return;

        const newPreset = {
            id: Date.now().toString(),
            name: presetName.trim(),
            filters: currentFilters,
            createdAt: new Date().toISOString(),
        };

        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setPresetName('');
        setIsDialogOpen(false);
    };

    const deletePreset = (id) => {
        const updated = presets.filter((p) => p.id !== id);
        setPresets(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const applyPreset = (preset) => {
        onApplyPreset(preset.filters);
    };

    const hasActiveFilters = Object.values(currentFilters).some(
        (value) => value !== null && value !== undefined && value !== '' && value !== 'all'
    );

    return (
        <div className="flex gap-2">
            {/* Save Current Filters */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={!hasActiveFilters}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Filters
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Filter Preset</DialogTitle>
                        <DialogDescription>
                            Give your current filter combination a name to quickly apply it later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="preset-name">Preset Name</Label>
                        <Input
                            id="preset-name"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="e.g., Pending Large Amounts"
                            onKeyDown={(e) => e.key === 'Enter' && savePreset()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={savePreset} disabled={!presetName.trim()}>
                            Save Preset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Load Saved Presets */}
            {presets.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Star className="mr-2 h-4 w-4" />
                            Saved Filters ({presets.length})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Saved Filter Presets</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {presets.map((preset) => (
                            <div key={preset.id} className="flex items-center justify-between px-2 py-1.5">
                                <button
                                    onClick={() => applyPreset(preset)}
                                    className="flex-1 text-left text-sm hover:bg-gray-100 rounded px-2 py-1"
                                >
                                    {preset.name}
                                </button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => deletePreset(preset.id)}
                                >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
