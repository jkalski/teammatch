'use client';

import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  flag_reason: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const [studentId, setStudentId] = useState('');
  const [inputId, setInputId] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    if (!inputId) {
      setError('Please enter your Student ID.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/notifications/student/${inputId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNotifications(data.sort((a: Notification, b: Notification) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setStudentId(inputId);
    } catch (e) {
      setError('Could not load notifications. Check your Student ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (e) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    if (!studentId || unreadCount === 0) return;
    try {
      const res = await fetch(`http://localhost:8000/notifications/student/${studentId}/read-all`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark all as read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      setError('Could not mark all notifications as read. Please try again.');
    }
  };

  const typeConfig = (type: string) => {
    switch (type) {
      case 'LOW_CONTRIBUTION':
        return { label: 'Low Contribution', color: 'bg-red-100 text-red-700', icon: '⚠️' };
      case 'MISSING_CHECKIN':
        return { label: 'Missing Check-in', color: 'bg-amber-100 text-amber-700', icon: '📋' };
      case 'INSTRUCTOR_NUDGE':
        return { label: 'Instructor Nudge', color: 'bg-blue-100 text-blue-700', icon: '💬' };
      case 'REQUEST_UPDATE':
        return { label: 'Update Requested', color: 'bg-purple-100 text-purple-700', icon: '🔄' };
      default:
        return { label: type, color: 'bg-stone-100 text-stone-600', icon: '🔔' };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono text-emerald-600 tracking-widest uppercase mb-3">TeamMatch</div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-stone-800">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-stone-500 mt-2">Stay on top of your contribution status and instructor messages.</p>
        </div>

        {/* Student ID Input */}
        <div className="flex gap-3 mb-8">
          <input
            className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition text-sm"
            placeholder="Enter your Student ID"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchNotifications()}
          />
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs text-stone-500 hover:text-stone-700 disabled:text-stone-300 border border-stone-200 disabled:border-stone-100 px-3 py-1.5 rounded-md transition"
            >
              Mark all as read
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && studentId && !loading && (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-stone-600 font-medium">You're all caught up!</p>
            <p className="text-stone-400 text-sm mt-1">No notifications at this time.</p>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map(notification => {
            const config = typeConfig(notification.type);
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border overflow-hidden transition ${
                  !notification.is_read ? 'border-stone-300 shadow-sm' : 'border-stone-200'
                }`}
              >
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{config.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                          )}
                          {notification.is_resolved && (
                            <span className="text-xs text-emerald-600 font-medium">Resolved</span>
                          )}
                        </div>
                        <p className="text-sm text-stone-700">{notification.message}</p>
                        {notification.flag_reason && (
                          <p className="text-xs text-stone-400 mt-1">Reason: {notification.flag_reason}</p>
                        )}
                        <p className="text-xs text-stone-400 mt-1">
                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-stone-400 hover:text-stone-600 border border-stone-200 px-3 py-1 rounded transition whitespace-nowrap"
                        >
                          Mark read
                        </button>
                      )}
                      {(notification.type === 'LOW_CONTRIBUTION' || notification.type === 'MISSING_CHECKIN' || notification.type === 'REQUEST_UPDATE') && (
                        <a
                          href="/checkin"
                          className="text-xs text-emerald-600 hover:text-emerald-500 border border-emerald-200 px-3 py-1 rounded transition text-center whitespace-nowrap"
                        >
                          Submit check-in
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}