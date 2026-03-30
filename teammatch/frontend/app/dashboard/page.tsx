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

export default function DashboardPage() {
  const [view, setView] = useState<'courses' | 'students' | 'matchruns'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [matchRuns, setMatchRuns] = useState<MatchRun[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', instructor_id: 'instructor-001', team_size: 4 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents(selectedCourse.id);
      fetchMatchRuns(selectedCourse.id);
    }
  }, [selectedCourse]);

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

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Top Nav */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-600 tracking-widest uppercase">TeamMatch</span>
          <span className="text-stone-300">|</span>
          <span className="text-sm text-stone-500">Instructor Dashboard</span>
          <span className="text-stone-300">|</span>
          <a href="/projects" className="text-sm text-stone-500 hover:text-emerald-600 transition">Projects</a>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition"
        >
          + New Course
        </button>
      </div>

      <div className="flex h-[calc(100vh-57px)]">

        {/* Sidebar — Course List */}
        <div className="w-64 bg-white border-r border-stone-200 overflow-y-auto">
          <div className="p-4">
            <p className="text-xs font-mono text-stone-400 tracking-widest uppercase mb-3">Courses</p>
            {courses.length === 0 && (
              <p className="text-sm text-stone-400">No courses yet.</p>
            )}
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition ${
                  selectedCourse?.id === course.id
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'hover:bg-stone-50'
                }`}
              >
                <p className={`text-sm font-medium ${selectedCourse?.id === course.id ? 'text-emerald-700' : 'text-stone-700'}`}>
                  {course.name}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">Code: {course.team_code}</p>
              </button>
            ))}
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