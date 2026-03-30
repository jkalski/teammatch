'use client';

import { useState, useEffect } from 'react';

export default function JoinPage() {
  const [form, setForm] = useState({
    team_code: '',
    student_id: '',
  });

  useEffect(() => {
    const studentId = localStorage.getItem('tm_student_id') || '';
    setForm(p => ({ ...p, student_id: studentId }));
  }, []);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setError('');

    if (!form.team_code || !form.student_id) {
      setError('Both fields are required.');
      return;
    }

    setLoading(true);
    try {
      // Look up student and verify they exist
      const res = await fetch(`http://localhost:8000/students/${form.student_id}`);
      if (!res.ok) {
        setError('Student ID not found. Please submit your profile first.');
        return;
      }
      setJoined(true);
    } catch (e) {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (joined) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-2">You've joined!</h2>
          <p className="text-stone-500 mb-2">Team code: <span className="font-mono font-bold text-emerald-600">{form.team_code}</span></p>
          <p className="text-stone-400 text-sm">Your instructor will finalize teams soon. Check back for your assignment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-xs font-mono text-emerald-600 tracking-widest uppercase mb-3">TeamMatch</div>
          <h1 className="text-4xl font-bold text-stone-800 mb-2">Join Your Team</h1>
          <p className="text-stone-500">Enter the team code provided by your instructor.</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-4">

          <div>
            <label className="text-xs font-mono text-stone-400 tracking-widest uppercase block mb-2">Team Code</label>
            <input
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition font-mono text-lg tracking-widest uppercase"
              placeholder="e.g. 5A28482E"
              value={form.team_code}
              onChange={e => setForm(p => ({ ...p, team_code: e.target.value.toUpperCase() }))}
              maxLength={8}
            />
          </div>

          <div>
            <label className="text-xs font-mono text-stone-400 tracking-widest uppercase block mb-2">Your Student ID</label>
            <input
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition text-sm"
              placeholder="Paste your student ID"
              value={form.student_id}
              onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
            />
            <p className="text-xs text-stone-400 mt-1">Your ID was shown after submitting your profile survey.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-lg transition text-sm tracking-wide shadow-sm"
          >
            {loading ? 'Joining...' : 'Join Team →'}
          </button>

          <div className="border-t border-stone-100 pt-4">
            <p className="text-xs text-stone-400 text-center">
              Haven't submitted your profile yet?{' '}
              <a href="/survey" className="text-emerald-600 hover:underline">Complete your survey first →</a>
            </p>
          </div>

        </div>

        {/* What counts as contribution */}
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs font-mono text-emerald-600 tracking-widest uppercase mb-2">What counts as contribution?</p>
          <ul className="text-sm text-stone-600 space-y-1">
            <li>→ Weekly check-in submissions</li>
            <li>→ Hours logged and tasks completed</li>
            <li>→ Evidence links (GitHub, Docs, Figma)</li>
            <li>→ Peer shoutouts received</li>
          </ul>
        </div>

      </div>
    </div>
  );
}