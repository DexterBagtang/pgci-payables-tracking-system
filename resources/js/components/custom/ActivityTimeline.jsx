import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Clock } from 'lucide-react';

export default function ActivityTimeline({ activity_logs, title = "Recent Activity", entityType = "item" }) {
    // Simplified action mapping - professional style
    const getActionDetails = (action) => {
        const actionMap = {
            // Creation
            'created': { color: 'bg-blue-500', label: 'Created' },
            'added': { color: 'bg-blue-500', label: 'Added' },

            // Updates
            'updated': { color: 'bg-orange-500', label: 'Updated' },
            'modified': { color: 'bg-orange-500', label: 'Modified' },
            'edited': { color: 'bg-orange-500', label: 'Edited' },

            // Status changes
            'submitted': { color: 'bg-purple-500', label: 'Submitted' },
            'approved': { color: 'bg-green-500', label: 'Approved' },
            'rejected': { color: 'bg-red-500', label: 'Rejected' },
            'completed': { color: 'bg-green-600', label: 'Completed' },
            'cancelled': { color: 'bg-red-500', label: 'Cancelled' },

            // Communication
            'commented': { color: 'bg-gray-500', label: 'Commented' },
            'noted': { color: 'bg-gray-500', label: 'Added note' },

            // Assignment
            'assigned': { color: 'bg-indigo-500', label: 'Assigned' },
            'reassigned': { color: 'bg-indigo-400', label: 'Reassigned' },

            // Additional professional actions
            'reviewed': { color: 'bg-cyan-500', label: 'Reviewed' },
            'forwarded': { color: 'bg-purple-400', label: 'Forwarded' },
            'received': { color: 'bg-green-400', label: 'Received' },
            'sent': { color: 'bg-purple-500', label: 'Sent' },
            'deleted': { color: 'bg-red-400', label: 'Deleted' },
            'restored': { color: 'bg-green-500', label: 'Restored' },
        };

        return actionMap[action] || {
            color: 'bg-gray-400',
            label: action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')
        };
    };

    // Helper function to format user display
    const formatUser = (user) => {
        if (!user) return 'System';
        if (typeof user === 'string') return user;
        return user.name || user.username || user.email?.split('@')[0] || 'Someone';
    };

    // Helper function to format actual date
    const formatActualDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
    };

    // Helper function to format date - human diff + actual date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);
            const diffInWeeks = Math.floor(diffInDays / 7);
            const diffInMonths = Math.floor(diffInDays / 30);
            const diffInYears = Math.floor(diffInDays / 365);

            let humanDiff;
            if (diffInSeconds < 60) {
                humanDiff = 'just now';
            } else if (diffInMinutes < 60) {
                humanDiff = `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
            } else if (diffInHours < 24) {
                humanDiff = `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
            } else if (diffInDays < 7) {
                humanDiff = `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
            } else if (diffInWeeks < 4) {
                humanDiff = `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
            } else if (diffInMonths < 12) {
                humanDiff = `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
            } else {
                humanDiff = `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
            }

            const actualDate = formatActualDate(date);
            return { humanDiff, actualDate };
        } catch (e) {
            return { humanDiff: dateString, actualDate: '' };
        }
    };

    // Get the note/comment to display
    const getDisplayNote = (log) => {
        return log.notes || log.comment || log.description || null;
    };

    if (!activity_logs || activity_logs.length === 0) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-slate-800 text-lg">
                        <Clock className="mr-2 h-5 w-5 text-slate-600" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-slate-500">
                        <div className="text-4xl mb-3">📝</div>
                        <p className="text-sm">No activity yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-slate-800 text-lg">
                    <Clock className="mr-2 h-5 w-5 text-slate-600" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {activity_logs.slice(0, 10).map((log, index) => { // Show only last 10 activities
                        const actionDetails = getActionDetails(log.action);
                        const userDisplay = formatUser(log.user);
                        const { humanDiff, actualDate } = formatDate(log.created_at || log.timestamp || log.date);
                        const note = getDisplayNote(log);

                        return (
                            <div key={log.id || index} className="relative flex items-start space-x-3 hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors">
                                {/* Action indicator */}
                                <div className={`h-3 w-3 ${actionDetails.color} rounded-full flex-shrink-0 mt-2`}>
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Main activity description */}
                                    <div className="text-sm text-slate-900">
                                        <span className="font-medium">{userDisplay}</span>
                                        <span className="text-slate-600 mx-1">{actionDetails.label.toLowerCase()}</span>
                                        <span className="text-slate-500">this {entityType}</span>
                                    </div>

                                    {/* Note if present */}
                                    {note && (
                                        <div className="mt-2 text-sm text-slate-600 bg-slate-50 border-l-3 border-slate-300 pl-3 py-1">
                                            <span className="font-medium text-slate-700">Note:</span> {note}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="mt-1 text-xs text-slate-500">
                                        <span className="font-medium">{humanDiff}</span>
                                        {actualDate && (
                                            <>
                                                <span className="mx-1.5 text-slate-300">•</span>
                                                <span className="text-slate-400">{actualDate}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Show count if there are more activities */}
                    {activity_logs.length > 10 && (
                        <div className="text-center pt-2">
                            <button className="text-xs text-slate-500 hover:text-slate-700">
                                View all {activity_logs.length} activities
                            </button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
