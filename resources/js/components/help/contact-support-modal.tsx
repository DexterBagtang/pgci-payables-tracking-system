import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react';

interface ContactSupportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContactSupportModal({ open, onOpenChange }: ContactSupportModalProps) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Save to localStorage for admin review
        const supportRequests = JSON.parse(localStorage.getItem('help-support-requests') || '[]');
        supportRequests.push({
            subject,
            message,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
        });
        localStorage.setItem('help-support-requests', JSON.stringify(supportRequests));

        setSubmitted(true);

        // Reset form after delay
        setTimeout(() => {
            setSubject('');
            setMessage('');
            setSubmitted(false);
            onOpenChange(false);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Contact Support
                    </DialogTitle>
                    <DialogDescription>
                        Need help? Send a message to your system administrator.
                    </DialogDescription>
                </DialogHeader>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Brief description of your issue"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Describe your issue in detail..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                <Send className="mr-2 h-4 w-4" />
                                Send Message
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mb-3" />
                        <h3 className="font-semibold text-lg mb-1">Message Sent!</h3>
                        <p className="text-sm text-muted-foreground">
                            Your system administrator will contact you soon.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
