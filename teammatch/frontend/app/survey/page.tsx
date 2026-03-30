'use client';

import { useState, useEffect } from 'react';

const SKILLS = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Java', 'C++', 'Machine Learning', 'DevOps', 'UI/UX'];
const AVAILABILITY = ['Mon AM', 'Mon PM', 'Tue AM', 'Tue PM', 'Wed AM', 'Wed PM', 'Thu AM', 'Thu PM', 'Fri AM', 'Fri PM'];

export default function SurveyPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    course_id: '',
    experience_level: '',
    leadership_preference: '',
    role_preference: '',
    skills: [] as string[],
    availability: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('tm_name') || '';
    const email = localStorage.getItem('tm_email') || '';
    setForm(p => ({ ...p, name, email }));
  }, []);

  const toggleItem = (field: 'skills' | 'availability', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const toggleSingle = (field: 'experience_level' | 'leadership_preference', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field] === value ? '' : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      localStorage.setItem('tm_student_id', data.id);
      setStudentId(data.id);
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-2">You're in!</h2>
          <p className="text-stone-500 mb-6">Your profile has been submitted. Use your Student ID to join a course.</p>
          <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Your Student ID</p>
            <p className="font-mono text-sm text-emerald-700 break-all">{studentId}</p>
          </div>
          <a
            href="/join"
            className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition text-sm"
          >
            Join a Course →
          </a>
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
          <h1 className="text-4xl font-bold text-stone-800 mb-2">Student Profile</h1>
          <p className="text-stone-500">Tell us about your skills and availability so we can build the best team for you.</p>
        </div>

        <div className="space-y-10">

          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">01 — Basic Info</h2>
            <input
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              placeholder="Full name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
            <input
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              placeholder="University email"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
            <input
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              placeholder="Course ID (provided by your instructor)"
              value={form.course_id}
              onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))}
            />
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">02 — Skills</h2>
            <p className="text-sm text-stone-400">Select all that apply — click again to deselect</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleItem('skills', skill)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    form.skills.includes(skill)
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">03 — Experience Level</h2>
            <p className="text-sm text-stone-400">Click again to deselect</p>
            <div className="flex gap-3">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => toggleSingle('experience_level', level)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border capitalize transition-all ${
                    form.experience_level === level
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">04 — Availability</h2>
            <p className="text-sm text-stone-400">Select all times you're free — click again to deselect</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY.map(slot => (
                <button
                  key={slot}
                  onClick={() => toggleItem('availability', slot)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    form.availability.includes(slot)
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Leadership */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-stone-400 tracking-widest uppercase border-b border-stone-200 pb-2">05 — Role Preference</h2>
            <p className="text-sm text-stone-400">Click again to deselect</p>
            <div className="flex gap-3">
              {['leader', 'contributor', 'flexible'].map(role => (
                <button
                  key={role}
                  onClick={() => toggleSingle('leadership_preference', role)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border capitalize transition-all ${
                    form.leadership_preference === role
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
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
            {loading ? 'Submitting...' : 'Submit Profile →'}
          </button>

        </div>
      </div>
    </div>
  );
}