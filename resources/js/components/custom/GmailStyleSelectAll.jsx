import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, CheckSquare, Square, ListChecks } from 'lucide-react';

/**
 * Gmail-style Select All Component
 * Reusable component for bulk selection with dropdown options
 *
 * @param {Object} props
 * @param {number} props.selectedCount - Number of currently selected items
 * @param {number} props.visibleCount - Number of items visible on current page
 * @param {number} props.totalLoadedCount - Total number of items loaded (may be across pages)
 * @param {number} props.totalCount - Total number of items available
 * @param {Function} props.onSelectVisible - Handler for selecting all visible items
 * @param {Function} props.onSelectAllLoaded - Handler for selecting all loaded items
 * @param {Function} props.onClearSelection - Handler for clearing selection
 * @param {string} props.itemLabel - Label for items (e.g., "invoices", "items")
 */
export function GmailStyleSelectAll({
    selectedCount = 0,
    visibleCount = 0,
    totalLoadedCount = 0,
    totalCount = 0,
    onSelectVisible,
    onSelectAllLoaded,
    onClearSelection,
    itemLabel = 'items'
}) {
    const hasSelection = selectedCount > 0;
    const allVisibleSelected = selectedCount === visibleCount && visibleCount > 0;
    const allLoadedSelected = selectedCount === totalLoadedCount && totalLoadedCount > 0;
    const isPartialSelection = hasSelection && !allLoadedSelected;

    const handleCheckboxClick = () => {
        if (hasSelection) {
            onClearSelection();
        } else {
            onSelectVisible();
        }
    };

    return (
        <div className="flex items-center gap-1">
            {/* Main Checkbox */}
            <Checkbox
                checked={hasSelection}
                onCheckedChange={handleCheckboxClick}
                className={isPartialSelection ? 'data-[state=checked]:bg-blue-600' : ''}
                aria-label={hasSelection ? 'Deselect all' : 'Select all visible'}
            />

            {/* Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-accent"
                        aria-label="Select all options"
                    >
                        <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem
                        onClick={onSelectVisible}
                        className="text-xs cursor-pointer"
                        disabled={allVisibleSelected}
                    >
                        <CheckSquare className="h-3.5 w-3.5 mr-2 text-blue-600" />
                        <div className="flex flex-col">
                            <span className="font-medium">Select all visible</span>
                            <span className="text-slate-500">
                                {visibleCount} {itemLabel} on this page
                            </span>
                        </div>
                    </DropdownMenuItem>

                    {totalLoadedCount > visibleCount && (
                        <DropdownMenuItem
                            onClick={onSelectAllLoaded}
                            className="text-xs cursor-pointer"
                            disabled={allLoadedSelected}
                        >
                            <ListChecks className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                            <div className="flex flex-col">
                                <span className="font-medium">Select all loaded</span>
                                <span className="text-slate-500">
                                    All {totalLoadedCount} loaded {itemLabel}
                                </span>
                            </div>
                        </DropdownMenuItem>
                    )}

                    {hasSelection && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onClearSelection}
                                className="text-xs cursor-pointer text-slate-700"
                            >
                                <Square className="h-3.5 w-3.5 mr-2" />
                                <span>Clear selection</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Selection Info */}
            {hasSelection && (
                <span className="text-xs text-slate-600 ml-1">
                    {selectedCount} selected
                </span>
            )}
        </div>
    );
}
