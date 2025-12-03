import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Eye,
    Zap
} from 'lucide-react';
import { formatCurrency } from '@/components/custom/helpers';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import QuickReleaseModal from './QuickReleaseModal';

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDisbursement, setSelectedDisbursement] = useState(null);
    const [showQuickRelease, setShowQuickRelease] = useState(false);

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate]);

    const fetchCalendarData = async () => {
        setLoading(true);
        const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

        try {
            const response = await fetch(`/api/disbursements/calendar-data?start=${start}&end=${end}`);
            const data = await response.json();
            setCalendarData(data);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleQuickRelease = (disbursement) => {
        setSelectedDisbursement(disbursement);
        setShowQuickRelease(true);
    };

    const getDaysInMonth = () => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    };

    const getEventsForDate = (date) => {
        if (!calendarData) return [];
        return calendarData.events.filter(event =>
            isSameDay(new Date(event.start), date)
        );
    };

    const getDaySummary = (date) => {
        const events = getEventsForDate(date);
        if (events.length === 0) return null;

        const totalAmount = events.reduce((sum, e) => sum + (e.amount || 0), 0);
        return { count: events.length, totalAmount };
    };

    const getWeeklySummary = () => {
        if (!calendarData || !calendarData.daily_summary) return [];

        const weeks = [];
        const days = getDaysInMonth();

        for (let i = 0; i < days.length; i += 7) {
            const weekDays = days.slice(i, i + 7);
            const weekTotal = weekDays.reduce((sum, day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const summary = calendarData.daily_summary.find(s => s.date === dateStr);
                return sum + (summary?.total_amount || 0);
            }, 0);

            weeks.push({
                start: weekDays[0],
                end: weekDays[weekDays.length - 1],
                total: weekTotal,
            });
        }

        return weeks;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading calendar view...</p>
                </div>
            </div>
        );
    }

    const days = getDaysInMonth();
    const weeklySummary = getWeeklySummary();

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                            {format(currentDate, 'MMMM yyyy')}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Weekly Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Weekly Outflow Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {weeklySummary.map((week, idx) => (
                            <div key={idx} className="rounded-lg border p-3 bg-gray-50">
                                <p className="text-xs text-gray-600">
                                    {format(week.start, 'MMM dd')} - {format(week.end, 'dd')}
                                </p>
                                <p className="text-lg font-bold text-blue-900">
                                    {formatCurrency(week.total)}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Grid */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-7 gap-2">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-sm text-gray-600 pb-2">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Days */}
                        {days.map((day, idx) => {
                            const events = getEventsForDate(day);
                            const summary = getDaySummary(day);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div
                                    key={idx}
                                    className={`
                                        min-h-[120px] border rounded-lg p-2 cursor-pointer hover:bg-gray-50
                                        ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                        ${!isSameMonth(day, currentDate) ? 'opacity-40' : ''}
                                    `}
                                    onClick={() => setSelectedDate(events.length > 0 ? day : null)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {summary && (
                                            <Badge variant="secondary" className="text-xs">
                                                {summary.count}
                                            </Badge>
                                        )}
                                    </div>

                                    {summary && (
                                        <div className="text-xs font-bold text-green-700 mb-2">
                                            {formatCurrency(summary.totalAmount)}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        {events.slice(0, 2).map((event) => (
                                            <div
                                                key={event.id}
                                                className={`text-xs p-1 rounded truncate ${
                                                    event.is_released ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {events.length > 2 && (
                                            <div className="text-xs text-gray-500 font-semibold">
                                                +{events.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Selected Date Details */}
            {selectedDate && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">
                            Disbursements for {format(selectedDate, 'MMMM dd, yyyy')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {getEventsForDate(selectedDate).map((event) => (
                                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div className="flex-1">
                                        <p className="font-semibold">{event.title}</p>
                                        <div className="flex gap-3 text-sm text-gray-600 mt-1">
                                            <span>{formatCurrency(event.amount)}</span>
                                            <span>•</span>
                                            <span>{event.cr_count} CR(s)</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant={event.is_released ? 'default' : 'secondary'}>
                                            {event.status}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.visit(`/disbursements/${event.id}`)}
                                        >
                                            <Eye className="h-3 w-3" />
                                        </Button>
                                        {!event.is_released && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleQuickRelease(event)}
                                            >
                                                <Zap className="h-3 w-3 mr-1" />
                                                Release
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Release Modal */}
            {selectedDisbursement && (
                <QuickReleaseModal
                    disbursement={selectedDisbursement}
                    open={showQuickRelease}
                    onClose={() => {
                        setShowQuickRelease(false);
                        setSelectedDisbursement(null);
                    }}
                    onSuccess={() => {
                        fetchCalendarData();
                    }}
                />
            )}
        </div>
    );
}
