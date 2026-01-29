import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Flag, Eye } from 'lucide-react';

interface FeedbackData {
    [key: string]: {
        vote: 'up' | 'down';
        comment?: string;
        timestamp: string;
    };
}

interface IssueReport {
    manualSlug: string;
    manualTitle: string;
    category: string;
    description: string;
    timestamp: string;
}

export function AnalyticsSummary() {
    const [feedback, setFeedback] = useState<FeedbackData>({});
    const [issues, setIssues] = useState<IssueReport[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        // Load analytics data from localStorage
        const feedbackData = JSON.parse(localStorage.getItem('help-feedback') || '{}');
        const issueReports = JSON.parse(localStorage.getItem('help-issue-reports') || '[]');
        const searches = JSON.parse(localStorage.getItem('help-recent-searches') || '[]');

        setFeedback(feedbackData);
        setIssues(issueReports);
        setRecentSearches(searches);
    }, []);

    // Calculate stats
    const totalFeedback = Object.keys(feedback).length;
    const positiveFeedback = Object.values(feedback).filter(f => f.vote === 'up').length;
    const negativeFeedback = Object.values(feedback).filter(f => f.vote === 'down').length;
    const satisfactionRate = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0;

    // Most viewed guides (from recently viewed)
    const recentlyViewed = JSON.parse(localStorage.getItem('help-recently-viewed') || '[]');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Help Analytics</h2>
                <p className="text-muted-foreground">
                    Usage statistics and feedback from documentation users
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalFeedback}</div>
                        <p className="text-xs text-muted-foreground">
                            {satisfactionRate}% satisfaction rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Positive</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <span className="text-2xl font-bold">{positiveFeedback}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Negative</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                            <span className="text-2xl font-bold">{negativeFeedback}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-orange-600" />
                            <span className="text-2xl font-bold">{issues.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Searches</CardTitle>
                        <CardDescription>What users are looking for</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSearches.length > 0 ? (
                            <ul className="space-y-2">
                                {recentSearches.slice(0, 10).map((search, index) => (
                                    <li key={index} className="text-sm flex items-center gap-2">
                                        <Eye className="h-3 w-3 text-muted-foreground" />
                                        {search}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No search data available</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Issues</CardTitle>
                        <CardDescription>Latest documentation issues reported</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {issues.length > 0 ? (
                            <ul className="space-y-3">
                                {issues.slice(-5).reverse().map((issue, index) => (
                                    <li key={index} className="text-sm border-b pb-2 last:border-0">
                                        <p className="font-medium">{issue.manualTitle}</p>
                                        <p className="text-muted-foreground">{issue.category}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(issue.timestamp).toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No issues reported</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Feedback by Guide</CardTitle>
                    <CardDescription>Breakdown of feedback for each guide</CardDescription>
                </CardHeader>
                <CardContent>
                    {Object.keys(feedback).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(feedback).map(([slug, data]) => (
                                <div key={slug} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <span className="text-sm">{slug}</span>
                                    <div className="flex items-center gap-2">
                                        {data.vote === 'up' ? (
                                            <ThumbsUp className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <ThumbsDown className="h-3 w-3 text-red-600" />
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(data.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No feedback data available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
