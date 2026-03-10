'use client';

import { useState } from 'react';

interface CheckIn {
  id: string;
  week_number: number;
  hours_worked: number;
  tasks_completed: string;
  what_i_worked_on: string;
  tasks_planned: string | null;
  next_week_plan: string | null;
  completion_status: string | null;
  contribution_type: string | null;
  confidence_level: number | null;
  blocked_by: string | null;
  needs_help: boolean;
  blockers: string | null;
  evidence_url: string | null;
  peer_shoutout: string | null;
  is_edited: boolean;
  created_at: string;
}

export default function HistoryPage() {
  const [studentId, setStudentId] = useState('');
  const [inputId, setInputId] = useState('');
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!inputId) {
      setError('Please enter your Student ID.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/checkins/student/${inputId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const sorted = data.sort((a: CheckIn, b: CheckIn) => b.week_number - a.week_number);
      setCheckins(sorted);
      setStudentId(inputId);
    } catch (e) {
      setError('Could not load check-ins. Check your Student ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string | null) => {
    if (status === 'On Track') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Behind') return 'bg-amber-100 text-amber-700';
    if (status === 'Blocked') return 'bg-red-100 text-red-700';
    return 'bg-stone-100 text-stone-500';
  };

  const confidenceLabel = (level: number | null) => {
    if (!level) return null;
    const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return labels[level - 1];
  };

  const totalHours = checkins.reduce((sum, c) => sum + c.hours_worked, 0);
  const avgConfidence = checkins.filter(c => c.confidence_level).length > 0
    ? (checkins.reduce((sum, c) => sum + (c.confidence_level || 0), 0) / checkins.filter(c => c.confidence_level).length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono text-emerald-600 tracking-widest uppercase mb-3">TeamMatch</div>
          <h1 className="text-4xl font-bold text-stone-800 mb-2">Contribution History</h1>
          <p className="text-stone-500">View your weekly check-in history and contribution timeline.</p>
        </div>

        {/* Student ID Input */}
        <div className="flex gap-3 mb-8">
          <input
            className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition text-sm"
            placeholder="Enter your Student ID"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchHistory()}
          />
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Load History'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Summary */}
        {checkins.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Check-ins</p>
              <p className="text-3xl font-bold text-stone-800">{checkins.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-stone-800">{totalHours}</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Avg Confidence</p>
              <p className="text-3xl font-bold text-stone-800">{avgConfidence ?? '—'}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {checkins.length === 0 && studentId && !loading && (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <p className="text-stone-400">No check-ins found for this student ID.</p>
            <a href="/checkin" className="text-emerald-600 text-sm hover:underline mt-2 block">
              Submit your first check-in →
            </a>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          {checkins.map(checkin => (
            <div key={checkin.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">

              {/* Row Header */}
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition"
                onClick={() => setExpandedId(expandedId === checkin.id ? null : checkin.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                    <span className="text-stone-600 font-bold text-sm">W{checkin.week_number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">Week {checkin.week_number}</p>
                    <p className="text-xs text-stone-400">{new Date(checkin.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-500">{checkin.hours_worked}h</span>
                  {checkin.completion_status && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(checkin.completion_status)}`}>
                      {checkin.completion_status}
                    </span>
                  )}
                  {checkin.contribution_type && (
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                      {checkin.contribution_type}
                    </span>
                  )}
                  {checkin.needs_help && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      Needs help
                    </span>
                  )}
                  <span className="text-stone-400 text-sm">{expandedId === checkin.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedId === checkin.id && (
                <div className="border-t border-stone-100 px-6 py-5 space-y-4">

                  {checkin.tasks_planned && (
                    <div>
                      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Tasks Planned</p>
                      <p className="text-sm text-stone-600 whitespace-pre-line">{checkin.tasks_planned}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Tasks Completed</p>
                    <p className="text-sm text-stone-600 whitespace-pre-line">{checkin.tasks_completed}</p>
                  </div>

                  <div>
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">What I Worked On</p>
                    <p className="text-sm text-stone-600">{checkin.what_i_worked_on}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {checkin.confidence_level && (
                      <div>
                        <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Confidence</p>
                        <p className="text-sm text-stone-600">{checkin.confidence_level}/5 — {confidenceLabel(checkin.confidence_level)}</p>
                      </div>
                    )}
                    {checkin.blocked_by && checkin.blocked_by !== 'None' && (
                      <div>
                        <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Blocked By</p>
                        <p className="text-sm text-stone-600">{checkin.blocked_by}</p>
                      </div>
                    )}
                  </div>

                  {checkin.blockers && (
                    <div>
                      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Blockers</p>
                      <p className="text-sm text-stone-600">{checkin.blockers}</p>
                    </div>
                  )}

                  {checkin.next_week_plan && (
                    <div>
                      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Next Week Plan</p>
                      <p className="text-sm text-stone-600">{checkin.next_week_plan}</p>
                    </div>
                  )}

                  {checkin.evidence_url && (
                    <div>
                      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Evidence</p>
                      <a href={checkin.evidence_url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline">
                        {checkin.evidence_url}
                      </a>
                    </div>
                  )}

                  {checkin.peer_shoutout && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                      <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-1">Peer Shoutout</p>
                      <p className="text-sm text-stone-600">"{checkin.peer_shoutout}"</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}