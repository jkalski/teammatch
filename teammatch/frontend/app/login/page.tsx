'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'instructor' | 'student' | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    if (!role) {
      setError('Please select a role.');
      return;
    }

    localStorage.setItem('tm_role', role);
    localStorage.setItem('tm_name', form.name.trim());
    localStorage.setItem('tm_email', form.email.trim());

    if (role === 'instructor') {
      router.push('/dashboard');
    } else {
      // Check if student already completed the survey
      const studentId = localStorage.getItem('tm_student_id');
      if (studentId) {
        router.push('/join');
      } else {
        router.push('/survey');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-xs font-mono text-emerald-600 tracking-widest uppercase mb-3">TeamMatch</div>
          <h1 className="text-4xl font-bold text-stone-800 mb-2">Welcome</h1>
          <p className="text-stone-500">Sign in to get started.</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-5">

          {/* Role Selection */}
          <div>
            <label className="text-xs font-mono text-stone-400 tracking-widest uppercase block mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {(['instructor', 'student'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-3 rounded-lg text-sm font-medium border capitalize transition-all ${
                    role === r
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-mono text-stone-400 tracking-widest uppercase block mb-2">Name</label>
            <input
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              placeholder="Your full name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-mono text-stone-400 tracking-widest uppercase block mb-2">Email</label>
            <input
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              placeholder="your@email.com"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition text-sm tracking-wide shadow-sm"
          >
            Continue →
          </button>

        </div>
      </div>
    </div>
  );
}
