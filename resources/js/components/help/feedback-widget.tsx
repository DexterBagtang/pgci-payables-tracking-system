import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { router } from '@inertiajs/react';

interface FeedbackWidgetProps {
    manualSlug: string;
}

export function FeedbackWidget({ manualSlug }: FeedbackWidgetProps) {
    const [voted, setVoted] = useState<'up' | 'down' | null>(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleVote = (vote: 'up' | 'down') => {
        setVoted(vote);

        // Save to localStorage for analytics
        const feedbackData = JSON.parse(localStorage.getItem('help-feedback') || '{}');
        feedbackData[manualSlug] = {
            vote,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem('help-feedback', JSON.stringify(feedbackData));

        // Show feedback form if negative
        if (vote === 'down') {
            setShowFeedbackForm(true);
        }
    };

    const handleSubmitFeedback = () => {
        // Save feedback
        const feedbackData = JSON.parse(localStorage.getItem('help-feedback') || '{}');
        if (feedbackData[manualSlug]) {
            feedbackData[manualSlug].comment = feedback;
        }
        localStorage.setItem('help-feedback', JSON.stringify(feedbackData));

        setSubmitted(true);
        setTimeout(() => {
            setShowFeedbackForm(false);
            setFeedback('');
        }, 2000);
    };

    return (
        <Card className="mt-12 print:hidden">
            <CardContent className="pt-6">
                {!voted ? (
                    <div>
                        <p className="font-medium mb-3">Was this guide helpful?</p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote('up')}
                            >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Yes
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote('down')}
                            >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                No
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {voted === 'up'
                                ? '✓ Thank you for your feedback!'
                                : 'We appreciate your feedback. Help us improve:'}
                        </p>

                        {showFeedbackForm && !submitted && (
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="What could we improve? (optional)"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <Button size="sm" onClick={handleSubmitFeedback}>
                                    <Send className="mr-2 h-3 w-3" />
                                    Submit
                                </Button>
                            </div>
                        )}

                        {submitted && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                ✓ Feedback submitted. Thank you!
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
