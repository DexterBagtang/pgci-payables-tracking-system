import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Flag } from 'lucide-react';

interface ReportIssueButtonProps {
    manualSlug: string;
    manualTitle: string;
}

export function ReportIssueButton({ manualSlug, manualTitle }: ReportIssueButtonProps) {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        // Save issue report to localStorage
        const reports = JSON.parse(localStorage.getItem('help-issue-reports') || '[]');
        reports.push({
            manualSlug,
            manualTitle,
            category,
            description,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
        });
        localStorage.setItem('help-issue-reports', JSON.stringify(reports));

        setSubmitted(true);
        setTimeout(() => {
            setOpen(false);
            setSubmitted(false);
            setCategory('');
            setDescription('');
        }, 2000);
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="print:hidden"
            >
                <Flag className="mr-2 h-3 w-3" />
                Report Issue
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Documentation Issue</DialogTitle>
                        <DialogDescription>
                            Help us improve this guide by reporting errors or suggesting improvements.
                        </DialogDescription>
                    </DialogHeader>

                    {!submitted ? (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Guide</Label>
                                <p className="text-sm font-medium">{manualTitle}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Issue Type</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select issue type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="error">Error or incorrect information</SelectItem>
                                        <SelectItem value="unclear">Unclear or confusing</SelectItem>
                                        <SelectItem value="missing">Missing information</SelectItem>
                                        <SelectItem value="suggestion">Suggestion for improvement</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Please describe the issue or suggestion..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[120px]"
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={!category || !description}
                                className="w-full"
                            >
                                Submit Report
                            </Button>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-green-600 dark:text-green-400 font-medium">
                                ✓ Issue reported successfully
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Thank you for helping us improve our documentation!
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
