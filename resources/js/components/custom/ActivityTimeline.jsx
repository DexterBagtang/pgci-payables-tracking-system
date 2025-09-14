import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

export default function ActivityTimeline({ activity_logs, title = "Activity Timeline", entityType = "record" }) {
    // Helper function to get action details with generic fallbacks
    const getActionDetails = (action) => {
        const actionMap = {
            // Creation actions
            'created': { color: 'bg-blue-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Created` },
            'added': { color: 'bg-blue-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Added` },

            // Update actions
            'updated': { color: 'bg-amber-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Updated` },
            'modified': { color: 'bg-amber-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Modified` },
            'edited': { color: 'bg-amber-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Edited` },

            // Submission/Processing actions
            'submitted': { color: 'bg-purple-500', label: 'Submitted for Processing' },
            'sent': { color: 'bg-purple-500', label: 'Sent for Review' },
            'forwarded': { color: 'bg-purple-500', label: 'Forwarded' },

            // Receiving actions
            'received': { color: 'bg-green-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Received` },
            'acknowledged': { color: 'bg-green-500', label: 'Acknowledged' },

            // Approval actions
            'approved': { color: 'bg-emerald-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Approved` },
            'accepted': { color: 'bg-emerald-500', label: 'Accepted' },
            'validated': { color: 'bg-emerald-500', label: 'Validated' },
            'completed': { color: 'bg-emerald-500', label: 'Completed' },
            'closed': { color: 'bg-emerald-500', label: 'Closed' },

            // Rejection/Cancellation actions
            'rejected': { color: 'bg-red-500', label: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Rejected` },
            'declined': { color: 'bg-red-500', label: 'Declined' },
            'cancelled': { color: 'bg-red-500', label: 'Cancelled' },
            'deleted': { color: 'bg-red-500', label: 'Deleted' },

            // Status changes
            'pending': { color: 'bg-yellow-500', label: 'Set to Pending' },
            'on_hold': { color: 'bg-orange-500', label: 'Put on Hold' },
            'in_progress': { color: 'bg-indigo-500', label: 'In Progress' },
            'under_review': { color: 'bg-cyan-500', label: 'Under Review' },

            // Payment/Financial actions
            'paid': { color: 'bg-green-600', label: 'Payment Processed' },
            'payment_sent': { color: 'bg-green-600', label: 'Payment Sent' },
            'payment_received': { color: 'bg-green-600', label: 'Payment Received' },
            'refunded': { color: 'bg-orange-600', label: 'Refunded' },

            // Communication actions
            'commented': { color: 'bg-gray-500', label: 'Comment Added' },
            'noted': { color: 'bg-gray-500', label: 'Note Added' },
            'contacted': { color: 'bg-blue-400', label: 'Contact Made' },

            // Document actions
            'uploaded': { color: 'bg-teal-500', label: 'Document Uploaded' },
            'downloaded': { color: 'bg-teal-400', label: 'Document Downloaded' },
            'signed': { color: 'bg-purple-600', label: 'Document Signed' },

            // Assignment actions
            'assigned': { color: 'bg-violet-500', label: 'Assigned' },
            'reassigned': { color: 'bg-violet-400', label: 'Reassigned' },
            'unassigned': { color: 'bg-gray-400', label: 'Unassigned' },
        };

        return actionMap[action] || {
            color: 'bg-slate-400',
            label: action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')
        };
    };

    // Helper function to format changes
    const formatChanges = (changesString) => {
        if (!changesString) return null;

        try {
            const changes = typeof changesString === 'string' ? JSON.parse(changesString) : changesString;
            if (!changes || Object.keys(changes).length === 0) return null;

            return Object.entries(changes)
                .filter(([key]) => !['id', 'updated_at', 'created_at', 'created', 'modified'].includes(key))
                .map(([key, value]) => {
                    const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                    const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                    return `${fieldName}: ${displayValue}`;
                })
                .slice(0, 3) // Show only first 3 changes to keep it clean
                .join(', ');
        } catch (e) {
            console.warn('Error parsing changes:', e);
            return null;
        }
    };

    // Helper function to format user display
    const formatUser = (user) => {
        if (!user) return 'System';

        if (typeof user === 'string') return user;

        return user.name || user.username || user.email || `User ${user.id}` || 'Unknown User';
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'PPp');
        } catch (e) {
            return dateString;
        }
    };

    if (!activity_logs || activity_logs.length === 0) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-slate-800">
                        <Clock className="mr-2 h-5 w-5 text-slate-600" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-slate-500">
                        <Clock className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <p>No activity recorded yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-slate-800">
                    <Clock className="mr-2 h-5 w-5 text-slate-600" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activity_logs.map((log, index) => {
                        const actionDetails = getActionDetails(log.action);
                        const changes = formatChanges(log.changes);
                        const userDisplay = formatUser(log.user);
                        const dateDisplay = formatDate(log.created_at || log.timestamp || log.date);

                        return (
                            <div key={log.id || index} className="relative flex items-start space-x-3">
                                <div className={`h-3 w-3 ${actionDetails.color} z-10 mt-1.5 rounded-full flex-shrink-0`}></div>

                                {/* Timeline connector line */}
                                {index < activity_logs.length - 1 && (
                                    <div className="absolute top-6 left-1.5 -z-10 h-8 w-0.5 bg-slate-200"></div>
                                )}

                                <div className="flex-1 pb-4 min-w-0">
                                    <div className="text-sm font-medium text-slate-900">
                                        {actionDetails.label}
                                    </div>

                                    <div className="mt-1 text-xs text-slate-500">
                                        {dateDisplay} by {userDisplay}
                                    </div>

                                    {/* Notes/Comments */}
                                    {(log.notes || log.comment || log.description) && (
                                        <div className="mt-2 rounded-md border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                            <span className="font-medium text-slate-700">Note:</span>{' '}
                                            {log.notes || log.comment || log.description}
                                        </div>
                                    )}

                                    {/* Changes */}
                                    {changes && (
                                        <div className="mt-2 text-xs text-slate-600">
                                            <span className="font-medium text-slate-700">Changes:</span>{' '}
                                            {changes}
                                        </div>
                                    )}

                                    {/* Additional metadata */}
                                    <div className="mt-1 flex items-center space-x-3 text-xs text-slate-400">
                                        {log.ip_address && (
                                            <span>{log.ip_address}</span>
                                        )}
                                        {log.source && (
                                            <span>via {log.source}</span>
                                        )}
                                        {log.version && (
                                            <span>v{log.version}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
