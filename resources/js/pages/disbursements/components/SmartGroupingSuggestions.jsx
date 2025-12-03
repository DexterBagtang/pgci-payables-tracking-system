import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Lightbulb,
    TrendingUp,
    Building2,
    FolderKanban,
    AlertTriangle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { formatCurrency } from '@/components/custom/helpers';

export default function SmartGroupingSuggestions({ onApplySuggestion }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/disbursements/smart-grouping');
            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case 'medium':
                return <TrendingUp className="h-4 w-4 text-yellow-600" />;
            default:
                return <Lightbulb className="h-4 w-4 text-blue-600" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500 bg-red-50';
            case 'medium':
                return 'border-l-yellow-500 bg-yellow-50';
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return <Badge className="bg-red-600">Urgent</Badge>;
            case 'medium':
                return <Badge className="bg-yellow-600">Medium</Badge>;
            default:
                return <Badge variant="secondary">Normal</Badge>;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'same_vendor':
                return <Building2 className="h-4 w-4" />;
            case 'same_project':
                return <FolderKanban className="h-4 w-4" />;
            case 'urgent_aging':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Lightbulb className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Analyzing check requisitions...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        <div>
                            <CardTitle className="text-base">Smart Grouping Suggestions</CardTitle>
                            <CardDescription className="text-sm">
                                AI-powered recommendations based on vendor, project, and aging
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{suggestions.length} suggestions</Badge>
                        <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                    </div>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent>
                    <div className="space-y-3">
                        {suggestions.map((suggestion, idx) => (
                            <div
                                key={idx}
                                className={`border-l-4 rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTypeIcon(suggestion.type)}
                                            <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                                            {getPriorityBadge(suggestion.priority)}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">
                                            {suggestion.description}
                                        </p>

                                        <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-500 text-xs">Check Requisitions</p>
                                                <p className="font-bold">{suggestion.count}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Total Amount</p>
                                                <p className="font-bold text-green-700">
                                                    {formatCurrency(suggestion.total_amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Suggested Date</p>
                                                <p className="font-bold">
                                                    {new Date(suggestion.suggested_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {suggestion.max_aging && suggestion.max_aging > 30 && (
                                            <Alert variant={suggestion.max_aging > 60 ? 'destructive' : 'default'} className="mb-3">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription className="text-xs">
                                                    {suggestion.max_aging > 60 ? 'Critical: ' : 'Warning: '}
                                                    Contains invoices with {Math.round(suggestion.max_aging)} days aging
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <Button
                                        variant={suggestion.priority === 'high' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => onApplySuggestion(suggestion)}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                            <strong>Tip:</strong> These suggestions are optimized to minimize aging and group similar payments
                            for efficient processing. Click "Apply" to auto-select the recommended check requisitions.
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
