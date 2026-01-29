import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
    const shortcuts = [
        { keys: ['/', 'Ctrl+K'], description: 'Open search' },
        { keys: ['Ctrl+P'], description: 'Print current guide' },
        { keys: ['Esc'], description: 'Close modals' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{shortcut.description}</span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, i) => (
                                    <span key={i}>
                                        <kbd className="rounded bg-muted px-2 py-1 text-xs font-semibold">
                                            {key}
                                        </kbd>
                                        {i < shortcut.keys.length - 1 && (
                                            <span className="mx-1 text-muted-foreground">or</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
