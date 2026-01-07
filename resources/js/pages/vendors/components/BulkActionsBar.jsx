import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, XCircle, Trash2, ChevronDown } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export default function BulkActionsBar({ selectedCount, onActivate, onDeactivate, onDelete }) {
    const { canWrite } = usePermissions();

    if (selectedCount === 0 || !canWrite('vendors')) return null;

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    {selectedCount}
                </div>
                <span className="text-sm font-medium text-blue-900">
                    {selectedCount} vendor{selectedCount !== 1 ? 's' : ''} selected
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            Bulk Actions
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onActivate} className="gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Activate Selected
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDeactivate} className="gap-2">
                            <XCircle className="h-4 w-4 text-gray-600" />
                            Deactivate Selected
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={onDelete} 
                            className="gap-2 text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
