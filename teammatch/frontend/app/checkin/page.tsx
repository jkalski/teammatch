'use client';

import { useState } from 'react';

export default function CheckInPage() {
  const [form, setForm] = useState({
    student_id: '',
    team_id: '',
    course_id: '',
    hours_worked: '',
    tasks_planned: '',
    tasks_completed: '',
    what_i_worked_on: '',
    completion_status: '',
    contribution_type: '',
    confidence_level: '',
    blocked_by: '',
    needs_help: false,
    blockers: '',
    evidence_url: '',
    peer_shoutout: '',
    next_week_plan: '',
    week_number: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!form.student_id || !form.team_id || !form.course_id) {
      setError('Student ID, Team ID, and Course ID are required.');
      return;
    }
    if (!form.hours_worked || isNaN(parseInt(form.hours_worked))) {
      setError('Please enter a valid number of hours worked.');
      return;
    }
    if (!form.week_number || isNaN(parseInt(form.week_number))) {
      setError('Please enter a valid week number.');
      return;
    }
    if (!form.tasks_completed) {
      setError('Please describe the tasks you completed.');
      return;
    }
    if (!form.what_i_worked_on) {
      setError('Please describe what you worked on.');
      return;
    }
    if (!form.completion_status) {
      setError('Please select your completion status.');
      return;
    }
    if (!form.contribution_type) {
      setError('Please select your contribution type.');
      return;
    }
    if (!form.confidence_level) {
      setError('Please select your confidence level.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/checkins/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hours_worked: parseInt(form.hours_worked),
          week_number: parseInt(form.week_number),
          confidence_level: parseInt(form.confidence_level),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = errorData?.detail
          ? Array.isArray(errorData.detail)
            ? errorData.detail.map((d: any) => d.msg).join(', ')
            : errorData.detail
          : 'Submission failed. Please check your inputs.';
        setError(message);
        return;
      }

      setSubmitted(true);
    } catch (e) {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition text-sm";
  const inputClass = "w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition text-sm";
  const textareaClass = `${inputClass} resize-none`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-2">Check-in submitted!</h2>
          <p className="text-stone-500">Your progress has been logged for this week.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                student_id: '', team_id: '', course_id: '', hours_worked: '',
                tasks_planned: '', tasks_completed: '', what_i_worked_on: '',
                completion_status: '', contribution_type: '', confidence_level: '',
                blocked_by: '', needs_help: false, blockers: '', evidence_url: '',
                peer_shoutout: '', next_week_plan: '', week_number: '',
              });
            }}
            className="mt-6 px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-400 transition"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono text-emerald-600 tracking-widest uppercase mb-3">TeamMatch</div>
          <h1 className="text-4xl font-bold text-stone-800 mb-2">Weekly Check-in</h1>
          <p className="text-stone-500">Log your progress for this week. Takes about 2 minutes.</p>
        </div>

        <div className="space-y-8">

          {/* Identity */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">01 — Identity</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Student ID" value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} />
              <input className={inputClass} placeholder="Team ID" value={form.team_id} onChange={e => setForm(p => ({ ...p, team_id: e.target.value }))} />
              <input className={inputClass} placeholder="Course ID" value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))} />
              <input className={inputClass} placeholder="Week number (e.g. 3)" type="number" value={form.week_number} onChange={e => setForm(p => ({ ...p, week_number: e.target.value }))} />
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">02 — Hours Worked</h2>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map(h => (
                <button
                  key={h}
                  onClick={() => setForm(p => ({ ...p, hours_worked: p.hours_worked === String(h) ? '' : String(h) }))}
                  className={`w-12 h-12 rounded-lg text-sm font-medium border transition-all ${
                    form.hours_worked === String(h)
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <input className={`${inputClass} w-40`} placeholder="Or enter hours" type="number" value={form.hours_worked} onChange={e => setForm(p => ({ ...p, hours_worked: e.target.value }))} />
          </div>

          {/* Tasks Planned */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">03 — Tasks Planned</h2>
            <textarea className={textareaClass} placeholder="What tasks were assigned to you this week?" rows={3} value={form.tasks_planned} onChange={e => setForm(p => ({ ...p, tasks_planned: e.target.value }))} />
          </div>

          {/* Tasks Completed */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">04 — Tasks Completed</h2>
            <textarea className={textareaClass} placeholder="List the tasks you completed this week (one per line)" rows={4} value={form.tasks_completed} onChange={e => setForm(p => ({ ...p, tasks_completed: e.target.value }))} />
          </div>

          {/* What I worked on */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">05 — What I Worked On</h2>
            <textarea className={textareaClass} placeholder="Briefly describe what you worked on this week..." rows={3} value={form.what_i_worked_on} onChange={e => setForm(p => ({ ...p, what_i_worked_on: e.target.value }))} />
          </div>

          {/* Status + Type */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">06 — Status & Contribution</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Completion Status</label>
                <select className={selectClass} value={form.completion_status} onChange={e => setForm(p => ({ ...p, completion_status: e.target.value }))}>
                  <option value="">Select status</option>
                  <option value="On Track">On Track</option>
                  <option value="Behind">Behind</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Contribution Type</label>
                <select className={selectClass} value={form.contribution_type} onChange={e => setForm(p => ({ ...p, contribution_type: e.target.value }))}>
                  <option value="">Select type</option>
                  <option value="Coding">Coding</option>
                  <option value="Research">Research</option>
                  <option value="Design">Design</option>
                  <option value="Testing">Testing</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Project Management">Project Management</option>
                </select>
              </div>
            </div>
          </div>

          {/* Confidence + Blocked By */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">07 — Confidence & Blockers</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Confidence Level (1–5)</label>
                <select className={selectClass} value={form.confidence_level} onChange={e => setForm(p => ({ ...p, confidence_level: e.target.value }))}>
                  <option value="">Select level</option>
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} — {['Very low', 'Low', 'Moderate', 'High', 'Very high'][n - 1]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Blocked By</label>
                <select className={selectClass} value={form.blocked_by} onChange={e => setForm(p => ({ ...p, blocked_by: e.target.value }))}>
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Teammate dependency">Teammate dependency</option>
                  <option value="Unclear requirements">Unclear requirements</option>
                  <option value="Technical issue">Technical issue</option>
                  <option value="Waiting on feedback">Waiting on feedback</option>
                </select>
              </div>
            </div>
            <textarea className={textareaClass} placeholder="Any blockers or challenges you're facing?" rows={2} value={form.blockers} onChange={e => setForm(p => ({ ...p, blockers: e.target.value }))} />
          </div>

          {/* Needs Help */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">08 — Help Needed</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.needs_help}
                onChange={e => setForm(p => ({ ...p, needs_help: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-sm text-stone-600">I need help from my instructor or teammates.</span>
            </label>
          </div>

          {/* Next Week Plan */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">09 — Next Week Plan</h2>
            <textarea className={textareaClass} placeholder="What do you plan to work on next week?" rows={3} value={form.next_week_plan} onChange={e => setForm(p => ({ ...p, next_week_plan: e.target.value }))} />
          </div>

          {/* Evidence */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">10 — Evidence Link <span className="text-stone-300 normal-case font-normal">(optional)</span></h2>
            <input className={inputClass} placeholder="GitHub PR, Google Doc, Figma link..." value={form.evidence_url} onChange={e => setForm(p => ({ ...p, evidence_url: e.target.value }))} />
          </div>

          {/* Peer Shoutout */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">11 — Peer Shoutout <span className="text-stone-300 normal-case font-normal">(optional)</span></h2>
            <input className={inputClass} placeholder="Give a shoutout to a teammate who helped you this week" value={form.peer_shoutout} onChange={e => setForm(p => ({ ...p, peer_shoutout: e.target.value }))} />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-lg transition text-sm tracking-wide shadow-sm"
          >
            {loading ? 'Submitting...' : 'Submit Check-in →'}
          </button>

        </div>
      </div>
    </div>
  );
}