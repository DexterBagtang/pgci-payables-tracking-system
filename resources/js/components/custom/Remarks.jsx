import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { FileText, Plus, Clock, User, MessageSquare } from "lucide-react";

export default function Remarks({ remarkableType, remarkableId, remarks = [] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm({
        remarkable_type: `App\\Models\\${remarkableType}`,
        remarkable_id: remarkableId,
        remark_text: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.data.remark_text.trim()) return;

        form.post('/remarks', {
            preserveScroll: true,
            onSuccess: (page) => {
                form.reset("remark_text");
                setIsDialogOpen(false);
            },
        });
    };

    const formatDateTime = (date) => {
        const remarkDate = new Date(date);
        return remarkDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100">
                            <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Remarks & Notes</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {remarks.length} {remarks.length === 1 ? 'entry' : 'entries'}
                            </p>
                        </div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Remark
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
                                        placeholder="Enter your professional remark or observation..."
                                        value={form.data.remark_text}
                                        onChange={(e) => form.setData("remark_text", e.target.value)}
                                        className="min-h-[120px] resize-none"
                                        disabled={form.processing}
                                    />
                                    {form.errors.remark_text && (
                                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                                            {form.errors.remark_text}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        disabled={form.processing}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing || !form.data.remark_text.trim()}
                                        className="flex-1"
                                    >
                                        {form.processing ? "Saving..." : "Save Remark"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                {remarks.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <div className="mx-auto w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-3">
                            <FileText className="h-6 w-6 text-slate-500" />
                        </div>
                        <h3 className="text-base font-medium text-slate-900 mb-1">No remarks recorded</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Click "Add Remark" to document observations or notes.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {remarks.map((remark, index) => (
                            <div key={remark.id} className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-slate-100 text-slate-700 font-medium">
                                                {remark.user?.name?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {remark.user?.name || "System User"}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDateTime(remark.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {index === 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            Latest
                                        </Badge>
                                    )}
                                </div>

                                <div className="pl-13">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {remark.remark_text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
