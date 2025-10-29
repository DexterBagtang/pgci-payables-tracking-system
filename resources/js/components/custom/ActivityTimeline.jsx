import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Badge } from '@/components/ui/badge.js';
import {
    Clock,
    Plus,
    Edit3,
    CheckCircle2,
    XCircle,
    FileUp,
    FileX,
    MessageSquare,
    ArrowUpCircle,
    ArrowDownCircle,
    Users,
    Package,
    FileText,
    CreditCard,
    Trash2,
    RotateCcw,
    Send,
    Mail,
    Eye,
    AlertCircle,
    Activity
} from 'lucide-react';

export default function ActivityTimeline({ activity_logs, title = "Activity History", entityType = "item" }) {

    // Get icon and color scheme for each action type
    const getActionStyle = (action) => {
        const styleMap = {
            // Creation actions - Blue
            'created': {
                icon: Plus,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-700'
            },
            'added': {
                icon: Plus,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-700'
            },

            // Update actions - Orange
            'updated': {
                icon: Edit3,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                badge: 'bg-orange-100 text-orange-700'
            },
            'modified': {
                icon: Edit3,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                badge: 'bg-orange-100 text-orange-700'
            },
            'edited': {
                icon: Edit3,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                badge: 'bg-orange-100 text-orange-700'
            },

            // Status changes - Purple
            'status_changed': {
                icon: Activity,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                badge: 'bg-purple-100 text-purple-700'
            },

            // Approval actions - Green
            'approved': {
                icon: CheckCircle2,
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-700'
            },
            'completed': {
                icon: CheckCircle2,
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-700'
            },
            'finalized': {
                icon: CheckCircle2,
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-700'
            },
            'approved_with_signed_document': {
                icon: CheckCircle2,
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-700'
            },

            // Rejection actions - Red
            'rejected': {
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                badge: 'bg-red-100 text-red-700'
            },
            'cancelled': {
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                badge: 'bg-red-100 text-red-700'
            },
            'deleted': {
                icon: Trash2,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                badge: 'bg-red-100 text-red-700'
            },

            // File actions - Teal
            'file_uploaded': {
                icon: FileUp,
                color: 'text-teal-600',
                bg: 'bg-teal-50',
                border: 'border-teal-200',
                badge: 'bg-teal-100 text-teal-700'
            },
            'file_removed': {
                icon: FileX,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                badge: 'bg-red-100 text-red-700'
            },
            'file_updated': {
                icon: FileUp,
                color: 'text-teal-600',
                bg: 'bg-teal-50',
                border: 'border-teal-200',
                badge: 'bg-teal-100 text-teal-700'
            },

            // Comment actions - Gray
            'commented': {
                icon: MessageSquare,
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                badge: 'bg-gray-100 text-gray-700'
            },
            'noted': {
                icon: MessageSquare,
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                badge: 'bg-gray-100 text-gray-700'
            },
            'comment_updated': {
                icon: MessageSquare,
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                badge: 'bg-gray-100 text-gray-700'
            },
            'comment_deleted': {
                icon: MessageSquare,
                color: 'text-gray-500',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                badge: 'bg-gray-100 text-gray-600'
            },

            // Relationship actions - Indigo
            'purchase_order_added': {
                icon: Package,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                badge: 'bg-indigo-100 text-indigo-700'
            },
            'invoice_added': {
                icon: FileText,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                badge: 'bg-indigo-100 text-indigo-700'
            },
            'invoices_added': {
                icon: FileText,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                badge: 'bg-indigo-100 text-indigo-700'
            },
            'check_requisition_added': {
                icon: CreditCard,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                badge: 'bg-indigo-100 text-indigo-700'
            },

            // Review actions - Cyan
            'reviewed': {
                icon: Eye,
                color: 'text-cyan-600',
                bg: 'bg-cyan-50',
                border: 'border-cyan-200',
                badge: 'bg-cyan-100 text-cyan-700'
            },
            'received': {
                icon: ArrowDownCircle,
                color: 'text-cyan-600',
                bg: 'bg-cyan-50',
                border: 'border-cyan-200',
                badge: 'bg-cyan-100 text-cyan-700'
            },

            // Send actions - Purple
            'submitted': {
                icon: Send,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                badge: 'bg-purple-100 text-purple-700'
            },
            'sent': {
                icon: Send,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                badge: 'bg-purple-100 text-purple-700'
            },
            'forwarded': {
                icon: Mail,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                badge: 'bg-purple-100 text-purple-700'
            },

            // Bulk actions - Pink
            'bulk_mark_received': {
                icon: CheckCircle2,
                color: 'text-pink-600',
                bg: 'bg-pink-50',
                border: 'border-pink-200',
                badge: 'bg-pink-100 text-pink-700'
            },
            'bulk_approve': {
                icon: CheckCircle2,
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-700'
            },
            'bulk_reject': {
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                badge: 'bg-red-100 text-red-700'
            },

            // Other actions
            'assigned': {
                icon: Users,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-700'
            },
            'closed': {
                icon: AlertCircle,
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                badge: 'bg-gray-100 text-gray-700'
            },
            'restored': {
                icon: RotateCcw,
                color: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-700'
            },
        };

        return styleMap[action] || {
            icon: Activity,
            color: 'text-gray-600',
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            badge: 'bg-gray-100 text-gray-700'
        };
    };

    // Get readable action label
    const getActionLabel = (action) => {
        const labels = {
            'created': 'Created',
            'updated': 'Updated',
            'status_changed': 'Status Changed',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'file_uploaded': 'File Uploaded',
            'file_removed': 'File Removed',
            'commented': 'Commented',
            'purchase_order_added': 'PO Added',
            'invoice_added': 'Invoice Added',
            'invoices_added': 'Invoices Added',
            'check_requisition_added': 'Added to CR',
            'reviewed': 'Reviewed',
            'received': 'Received',
            'submitted': 'Submitted',
            'bulk_approve': 'Bulk Approved',
            'bulk_reject': 'Bulk Rejected',
            'finalized': 'Finalized',
        };

        return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Format user name
    const formatUser = (user) => {
        if (!user) return 'System';
        if (typeof user === 'string') return user;
        return user.name || user.username || user.email?.split('@')[0] || 'Unknown';
    };

    // Format relative time
    const formatRelativeTime = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return 'just now';

            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours}h ago`;

            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) return `${diffInDays}d ago`;

            const diffInWeeks = Math.floor(diffInDays / 7);
            if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

            const diffInMonths = Math.floor(diffInDays / 30);
            if (diffInMonths < 12) return `${diffInMonths}mo ago`;

            const diffInYears = Math.floor(diffInDays / 365);
            return `${diffInYears}y ago`;
        } catch {
            return '';
        }
    };

    // Format full date
    const formatFullDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateString;
        }
    };

    if (!activity_logs || activity_logs.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No activity recorded</p>
                        <p className="text-xs text-gray-400 mt-1">Actions will appear here</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        {title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {activity_logs.length} {activity_logs.length === 1 ? 'entry' : 'entries'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    {activity_logs.map((log, index) => {
                        const style = getActionStyle(log.action);
                        const Icon = style.icon;
                        const actionLabel = getActionLabel(log.action);
                        const userName = formatUser(log.user);
                        const relativeTime = formatRelativeTime(log.created_at || log.timestamp);
                        const fullDate = formatFullDate(log.created_at || log.timestamp);
                        const notes = log.notes || log.comment || log.description;

                        return (
                            <div
                                key={log.id || index}
                                className={`group relative rounded-lg border ${style.border} ${style.bg} p-3 transition-all hover:shadow-sm`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 ${style.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        {/* Header: Action + User + Time */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Badge className={`${style.badge} text-xs font-medium px-2 py-0 h-5`}>
                                                    {actionLabel}
                                                </Badge>
                                                <span className="text-xs font-semibold text-gray-900 truncate">
                                                    {userName}
                                                </span>
                                            </div>
                                            <time
                                                className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0"
                                                title={fullDate}
                                            >
                                                {relativeTime}
                                            </time>
                                        </div>

                                        {/* Notes/Description */}
                                        {notes && (
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {notes}
                                            </p>
                                        )}

                                        {/* Full date on hover */}
                                        <p className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {fullDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View all if too many */}
                {activity_logs.length > 20 && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Showing all {activity_logs.length} activities
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
