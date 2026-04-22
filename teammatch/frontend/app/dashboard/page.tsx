'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  name: string;
  instructor_id: string;
  team_size: number;
  team_code: string;
  created_at: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  experience_level: string;
  skills: string[];
  leadership_preference: string;
}

interface MatchRun {
  id: string;
  status: string;
  created_at: string;
}

function CourseRow({ course, selected, pinned, onSelect, onPin, onDelete, confirmDelete, onConfirmDelete, onCancelDelete }: {
  course: Course; selected: boolean; pinned: boolean;
  onSelect: () => void; onPin: () => void; onDelete: () => void;
  confirmDelete: boolean; onConfirmDelete: () => void; onCancelDelete: () => void;
}) {
  return (
    <div className="mb-1">
      <div
        className={`group w-full text-left px-3 py-3 rounded-lg transition flex items-start justify-between cursor-pointer ${
          selected ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-stone-50 border border-transparent'
        }`}
        onClick={onSelect}
      >
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${selected ? 'text-emerald-700' : 'text-stone-700'}`}>
            {course.name}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">Code: {course.team_code}</p>
        </div>
        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onPin(); }}
            className={`text-sm transition ${pinned ? 'text-amber-400 hover:text-stone-300' : 'text-stone-300 hover:text-amber-400'}`}
            title={pinned ? 'Unpin' : 'Pin to top'}
          >
            {pinned ? '★' : '☆'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-stone-300 hover:text-red-400 transition text-xs"
            title="Delete course"
          >
            ✕
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="mx-1 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 font-medium mb-1">Delete this course?</p>
          <p className="text-xs text-red-500 mb-3">This will permanently remove all students, teams, and data in this class.</p>
          <div className="flex gap-2">
            <button onClick={onConfirmDelete} className="flex-1 py-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-medium rounded transition">Delete</button>
            <button onClick={onCancelDelete} className="flex-1 py-1.5 border border-stone-200 text-stone-600 text-xs rounded hover:bg-stone-50 transition">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [view, setView] = useState<'courses' | 'students' | 'matchruns'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [matchRuns, setMatchRuns] = useState<MatchRun[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', instructor_id: 'instructor-001', team_size: 4 });
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tm_pinned_courses') || '[]'); } catch { return []; }
  });

  const togglePin = (courseId: string) => {
    setPinnedIds(prev => {
      const next = prev.includes(courseId) ? prev.filter(id => id !== courseId) : [courseId, ...prev];
      localStorage.setItem('tm_pinned_courses', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents(selectedCourse.id);
      fetchMatchRuns(selectedCourse.id);
    }
  }, [selectedCourse]);

  // Poll every 2s while any run is PENDING or RUNNING
  useEffect(() => {
    const hasActive = matchRuns.some(r => r.status === 'PENDING' || r.status === 'RUNNING');
    if (!hasActive || !selectedCourse) return;
    const timer = setTimeout(() => fetchMatchRuns(selectedCourse.id), 2000);
    return () => clearTimeout(timer);
  }, [matchRuns, selectedCourse]);

  const fetchCourses = async () => {
    const res = await fetch('http://localhost:8000/courses/');
    const data = await res.json();
    setCourses(data);
    if (data.length > 0) setSelectedCourse(data[0]);
  };

  const fetchStudents = async (courseId: string) => {
    const res = await fetch(`http://localhost:8000/students/course/${courseId}`);
    const data = await res.json();
    setStudents(data);
  };

  const fetchMatchRuns = async (courseId: string) => {
    const res = await fetch(`http://localhost:8000/matchruns/course/${courseId}`);
    const data = await res.json();
    setMatchRuns(data);
  };

  const createCourse = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:8000/courses/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse),
    });
    const data = await res.json();
    setCourses(prev => [...prev, data]);
    setSelectedCourse(data);
    setShowCreateForm(false);
    setNewCourse({ name: '', instructor_id: 'instructor-001', team_size: 4 });
    setLoading(false);
  };

  const triggerMatchRun = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    const res = await fetch('http://localhost:8000/matchruns/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: selectedCourse.id }),
    });
    const data = await res.json();
    setMatchRuns(prev => [data, ...prev]);
    setLoading(false);
  };

  const deleteCourse = async (courseId: string) => {
    await fetch(`http://localhost:8000/courses/${courseId}`, { method: 'DELETE' });
    const remaining = courses.filter(c => c.id !== courseId);
    setCourses(remaining);
    setSelectedCourse(remaining.length > 0 ? remaining[0] : null);
    setConfirmDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-stone-50">

      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <span className="text-sm text-stone-500 font-medium">Instructor Dashboard</span>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition"
        >
          + New Course
        </button>
      </div>

      <div className="flex h-[calc(100vh-113px)]">

        {/* Sidebar — Course List */}
        <div className="w-64 bg-white border-r border-stone-200 overflow-y-auto">
          <div className="p-4">
            {courses.length === 0 && <p className="text-sm text-stone-400">No courses yet.</p>}

            {/* Pinned */}
            {pinnedIds.filter(id => courses.find(c => c.id === id)).length > 0 && (
              <>
                <p className="text-xs font-mono text-amber-500 tracking-widest uppercase mb-2">Pinned</p>
                {pinnedIds.filter(id => courses.find(c => c.id === id)).map(id => {
                  const course = courses.find(c => c.id === id)!;
                  return <CourseRow key={course.id} course={course} selected={selectedCourse?.id === course.id} pinned onSelect={() => setSelectedCourse(course)} onPin={() => togglePin(course.id)} onDelete={() => setConfirmDeleteId(course.id)} confirmDelete={confirmDeleteId === course.id} onConfirmDelete={() => deleteCourse(course.id)} onCancelDelete={() => setConfirmDeleteId(null)} />;
                })}
                <div className="border-t border-stone-100 my-3" />
              </>
            )}

            {/* Other courses */}
            {courses.filter(c => !pinnedIds.includes(c.id)).length > 0 && (
              <>
                {pinnedIds.filter(id => courses.find(c => c.id === id)).length > 0 && (
                  <p className="text-xs font-mono text-stone-400 tracking-widest uppercase mb-2">Other</p>
                )}
                {courses.filter(c => !pinnedIds.includes(c.id)).map(course => (
                  <CourseRow key={course.id} course={course} selected={selectedCourse?.id === course.id} pinned={false} onSelect={() => setSelectedCourse(course)} onPin={() => togglePin(course.id)} onDelete={() => setConfirmDeleteId(course.id)} confirmDelete={confirmDeleteId === course.id} onConfirmDelete={() => deleteCourse(course.id)} onCancelDelete={() => setConfirmDeleteId(null)} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedCourse ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-stone-400 mb-4">No course selected</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg"
                >
                  Create your first course
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Course Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-stone-800">{selectedCourse.name}</h1>
                <div className="flex gap-4 mt-2">
                  <span className="text-sm text-stone-500">Team size: <strong>{selectedCourse.team_size}</strong></span>
                  <span className="text-sm text-stone-500">Join code: <strong className="font-mono text-emerald-600">{selectedCourse.team_code}</strong></span>
                  <span className="text-sm text-stone-500">Students: <strong>{students.length}</strong></span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg w-fit">
                {(['courses', 'students', 'matchruns'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setView(tab)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition ${
                      view === tab ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {tab === 'courses' ? 'Overview' : tab === 'matchruns' ? 'Match Runs' : 'Students'}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {view === 'courses' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Students</p>
                    <p className="text-3xl font-bold text-stone-800">{students.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Team Size</p>
                    <p className="text-3xl font-bold text-stone-800">{selectedCourse.team_size}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Match Runs</p>
                    <p className="text-3xl font-bold text-stone-800">{matchRuns.length}</p>
                  </div>
                  <div className="col-span-3 bg-white rounded-xl border border-stone-200 p-6">
                    <p className="text-sm text-stone-500 mb-4">Share this code with your students so they can join the course in their survey.</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold text-emerald-600 tracking-widest">{selectedCourse.team_code}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedCourse.team_code)}
                        className="text-xs text-stone-400 hover:text-stone-600 border border-stone-200 px-3 py-1 rounded transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Tab */}
              {view === 'students' && (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  {students.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      No students enrolled yet. Share your course code: <strong className="font-mono text-emerald-600">{selectedCourse.team_code}</strong>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Name</th>
                          <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Email</th>
                          <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Level</th>
                          <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Skills</th>
                          <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(student => (
                          <tr key={student.id} className="border-b border-stone-50 hover:bg-stone-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-stone-800">{student.name}</td>
                            <td className="px-6 py-4 text-sm text-stone-500">{student.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                student.experience_level === 'advanced' ? 'bg-emerald-100 text-emerald-700' :
                                student.experience_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {student.experience_level}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {student.skills?.slice(0, 3).map(skill => (
                                  <span key={skill} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{skill}</span>
                                ))}
                                {student.skills?.length > 3 && (
                                  <span className="text-xs text-stone-400">+{student.skills.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-stone-500 capitalize">{student.leadership_preference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Match Runs Tab */}
              {view === 'matchruns' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-stone-500">{students.length} students ready for matching</p>
                    <button
                      onClick={triggerMatchRun}
                      disabled={loading || students.length === 0}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-medium rounded-lg transition"
                    >
                      {loading ? 'Running...' : '▶ Run Match'}
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    {matchRuns.length === 0 ? (
                      <div className="p-8 text-center text-stone-400">No match runs yet. Click "Run Match" to generate teams.</div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-stone-100">
                            <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Run ID</th>
                            <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Status</th>
                            <th className="text-left text-xs font-mono text-stone-400 uppercase tracking-widest px-6 py-4">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchRuns.map(run => (
                            <tr key={run.id} className="border-b border-stone-50 hover:bg-stone-50 transition">
                              <td className="px-6 py-4 text-xs font-mono text-stone-500">{run.id.slice(0, 8)}...</td>
                              <td className="px-6 py-4">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  run.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                  run.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {run.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-stone-500">
                                {new Date(run.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-stone-800 mb-4">Create New Course</h2>
            <div className="space-y-3">
              <input
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 transition"
                placeholder="Course name (e.g. CS 101 Fall 2026)"
                value={newCourse.name}
                onChange={e => setNewCourse(p => ({ ...p, name: e.target.value }))}
              />
              <div className="flex items-center gap-3">
                <label className="text-sm text-stone-500 w-24">Team size</label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  className="w-24 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 transition"
                  value={newCourse.team_size}
                  onChange={e => setNewCourse(p => ({ ...p, team_size: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={createCourse}
                disabled={loading || !newCourse.name}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 text-white text-sm font-medium rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}