import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { MessageSquare, Plus } from "lucide-react";
import { toast } from 'sonner';
import { router } from '@inertiajs/react';

export default function Remarks({ remarkableType, remarkableId, remarks = [] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [remarkText, setRemarkText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!remarkText.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            // Get CSRF cookie first (might not be needed for web routes, but good practice)
            // await axios.get('/sanctum/csrf-cookie');

            // Use the API-specific route
            const response = await axios.post('/remarks', {
                remarkable_type: `App\\Models\\${remarkableType}`,
                remarkable_id: remarkableId,
                remark_text: remarkText,
            });

            if (response.data.success) {
                setRemarkText('');
                setIsDialogOpen(false);
                toast.success(response.data.message);

                // Reload the page to get fresh data for all entities
                router.reload();
            }
        } catch (error) {
            console.error('Error creating remark:', error);

            if (error.response?.status === 401) {
                setError('Authentication failed. Please refresh the page and try again.');
            } else if (error.response?.status === 419) {
                setError('Session expired. Please refresh the page and try again.');
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                setError(errors.join(', '));
            } else {
                setError(error.response?.data?.message || 'Failed to create remark. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateTime = (date) => {
        const remarkDate = new Date(date);
        const now = new Date();
        const diffMs = now - remarkDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return remarkDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: remarkDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    // Clear error when dialog opens/closes
    useEffect(() => {
        if (!isDialogOpen) {
            setError('');
            setRemarkText('');
        }
    }, [isDialogOpen]);

    return (
        <div className="w-full border rounded-lg bg-white">
            {/* Compact Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-600" />
                    <h3 className="text-sm font-medium text-slate-900">
                        Remarks
                        <span className="ml-1.5 text-xs text-slate-500 font-normal">
                            ({remarks.length})
                        </span>
                    </h3>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs">
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Add New Remark
                            </DialogTitle>
                            <DialogDescription></DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="remark-text" className="text-sm font-medium">
                                    Remark Details
                                </Label>
                                <Textarea
                                    id="remark-text"
                                    placeholder="Enter your remark..."
                                    value={remarkText}
                                    onChange={(e) => setRemarkText(e.target.value)}
                                    className="min-h-[120px] resize-none"
                                    disabled={isSubmitting}
                                />
                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !remarkText.trim()}
                                    className="flex-1"
                                >
                                    {isSubmitting ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Comments Area */}
            <div className="px-4 py-3">
                {remarks.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-xs text-slate-400">No remarks yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {remarks.map((remark) => (
                            <div key={remark.id} className="flex gap-2.5 group">
                                <Avatar className="h-7 w-7 mt-0.5 flex-shrink-0">
                                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                        {remark.user?.name?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-medium text-slate-900">
                                            {remark.user?.name || "System User"}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {formatDateTime(remark.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 mt-0.5 leading-relaxed whitespace-pre-wrap break-words">
                                        {remark.remark_text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
