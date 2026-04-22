'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  name: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface CheckIn {
  id: string;
  student_id: string;
  team_id: string;
  course_id: string;
  hours_worked: number;
  tasks_planned: string | null;
  tasks_completed: string;
  what_i_worked_on: string;
  next_week_plan: string | null;
  completion_status: string | null;
  contribution_type: string | null;
  confidence_level: number | null;
  blocked_by: string | null;
  needs_help: boolean;
  blockers: string | null;
  evidence_url: string | null;
  peer_shoutout: string | null;
  week_number: number;
  is_edited: boolean;
  created_at: string;
}

function confidenceColor(level: number | null) {
  if (!level) return 'text-stone-400';
  if (level >= 4) return 'text-emerald-600';
  if (level === 3) return 'text-amber-500';
  return 'text-red-500';
}

function statusBadge(status: string | null) {
  if (!status) return null;
  const map: Record<string, string> = {
    on_track: 'bg-emerald-100 text-emerald-700',
    ahead: 'bg-blue-100 text-blue-700',
    behind: 'bg-amber-100 text-amber-700',
    blocked: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-stone-100 text-stone-600';
}

export default function CheckInsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CheckIn | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/courses/')
      .then(r => r.json())
      .then(data => {
        const sorted = [...data].sort((a: Course, b: Course) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCourses(sorted);
        if (sorted.length > 0) setSelectedCourse(sorted[0]);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setFilterTeam('');
    setFilterStudent('');
    setLoading(true);

    Promise.all([
      fetch(`http://localhost:8000/checkins/course/${selectedCourse.id}`).then(r => r.json()),
      fetch(`http://localhost:8000/teams/course/${selectedCourse.id}`).then(r => r.json()),
      fetch(`http://localhost:8000/students/course/${selectedCourse.id}`).then(r => r.json()),
    ]).then(([cks, tms, stds]) => {
      setCheckins(cks);
      setTeams(tms);
      const map: Record<string, Student> = {};
      stds.forEach((s: Student) => { map[s.id] = s; });
      setStudents(map);
      setLoading(false);
    });
  }, [selectedCourse]);

  const filtered = checkins.filter(c => {
    if (filterTeam && c.team_id !== filterTeam) return false;
    if (filterStudent && c.student_id !== filterStudent) return false;
    return true;
  });

  const teamName = (id: string) => teams.find(t => t.id === id)?.name ?? id;
  const studentName = (id: string) => students[id]?.name ?? id;

  const visibleStudents = filterTeam
    ? Object.values(students).filter(s => checkins.some(c => c.team_id === filterTeam && c.student_id === s.id))
    : Object.values(students);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <span className="text-sm text-stone-500 font-medium">Check-ins</span>
        <span className="text-xs text-stone-400">{filtered.length} submission{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex h-[calc(100vh-113px)]">
        {/* Sidebar filters */}
        <div className="w-56 bg-white border-r border-stone-200 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Course</p>
            <select
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 text-stone-700 bg-stone-50"
              value={selectedCourse?.id ?? ''}
              onChange={e => {
                const c = courses.find(c => c.id === e.target.value) ?? null;
                setSelectedCourse(c);
              }}
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Team</p>
            <select
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 text-stone-700 bg-stone-50"
              value={filterTeam}
              onChange={e => { setFilterTeam(e.target.value); setFilterStudent(''); }}
            >
              <option value="">All teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Student</p>
            <select
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 text-stone-700 bg-stone-50"
              value={filterStudent}
              onChange={e => setFilterStudent(e.target.value)}
            >
              <option value="">All students</option>
              {visibleStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {(filterTeam || filterStudent) && (
            <button
              onClick={() => { setFilterTeam(''); setFilterStudent(''); }}
              className="text-xs text-stone-400 hover:text-stone-600 transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-stone-400 text-sm">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-stone-400 text-sm">No check-ins found.</p>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Team</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Week</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Hours</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Confidence</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Needs Help</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-stone-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="border-b border-stone-50 hover:bg-stone-50 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 font-medium text-stone-700">{studentName(c.student_id)}</td>
                      <td className="px-4 py-3 text-stone-500">{teamName(c.team_id)}</td>
                      <td className="px-4 py-3 text-stone-500">Wk {c.week_number}</td>
                      <td className="px-4 py-3 text-stone-700">{c.hours_worked}h</td>
                      <td className={`px-4 py-3 font-semibold ${confidenceColor(c.confidence_level)}`}>
                        {c.confidence_level != null ? `${c.confidence_level}/5` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.completion_status ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(c.completion_status)}`}>
                            {c.completion_status.replace('_', ' ')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.needs_help ? (
                          <span className="text-xs font-medium text-red-500">Yes</span>
                        ) : (
                          <span className="text-xs text-stone-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-stone-100">
              <div>
                <p className="text-lg font-bold text-stone-800">{studentName(selected.student_id)}</p>
                <p className="text-sm text-stone-400 mt-0.5">{teamName(selected.team_id)} · Week {selected.week_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-stone-300 hover:text-stone-500 text-xl leading-none ml-4">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">Hours</p>
                  <p className="text-lg font-bold text-stone-700">{selected.hours_worked}h</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">Confidence</p>
                  <p className={`text-lg font-bold ${confidenceColor(selected.confidence_level)}`}>
                    {selected.confidence_level != null ? `${selected.confidence_level}/5` : '—'}
                  </p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">Status</p>
                  {selected.completion_status ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(selected.completion_status)}`}>
                      {selected.completion_status.replace('_', ' ')}
                    </span>
                  ) : <p className="text-sm text-stone-400">—</p>}
                </div>
              </div>

              {selected.what_i_worked_on && (
                <Field label="What I worked on" value={selected.what_i_worked_on} />
              )}
              {selected.tasks_completed && (
                <Field label="Tasks completed" value={selected.tasks_completed} />
              )}
              {selected.tasks_planned && (
                <Field label="Tasks planned" value={selected.tasks_planned} />
              )}
              {selected.next_week_plan && (
                <Field label="Next week plan" value={selected.next_week_plan} />
              )}
              {selected.contribution_type && (
                <Field label="Contribution type" value={selected.contribution_type} />
              )}
              {(selected.needs_help || selected.blockers || selected.blocked_by) && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-mono text-red-400 uppercase tracking-widest">Needs Help</p>
                  {selected.blockers && <p className="text-sm text-stone-700">{selected.blockers}</p>}
                  {selected.blocked_by && <p className="text-sm text-stone-500">Blocked by: {selected.blocked_by}</p>}
                </div>
              )}
              {selected.peer_shoutout && (
                <Field label="Peer shoutout" value={selected.peer_shoutout} />
              )}
              {selected.evidence_url && (
                <div>
                  <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Evidence</p>
                  <a href={selected.evidence_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline break-all">
                    {selected.evidence_url}
                  </a>
                </div>
              )}

              <p className="text-xs text-stone-300 pt-2 border-t border-stone-100">
                Submitted {new Date(selected.created_at).toLocaleString()}
                {selected.is_edited && ' · edited'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-stone-700 leading-relaxed">{value}</p>
    </div>
  );
}
