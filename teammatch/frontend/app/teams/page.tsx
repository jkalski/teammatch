'use client';

import { useState, useEffect, useCallback } from 'react';

interface Team {
  id: string;
  name: string;
  team_code: string;
  course_id: string;
  match_run_id: string;
  skill_balance_score: number | null;
  schedule_overlap_score: number | null;
  experience_balance_score: number | null;
  overall_score: number | null;
  explanation: string | null;
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

interface Milestone {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: string;
  milestones: Milestone[];
}

interface Course {
  id: string;
  name: string;
  team_code: string;
  created_at: string;
}

export default function TeamsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [studentsByTeam, setStudentsByTeam] = useState<Record<string, Student[]>>({});
  const [projectsByTeam, setProjectsByTeam] = useState<Record<string, Project[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem('tm_role');
    setRole(r);
    if (r === 'instructor') {
      fetch('http://localhost:8000/courses/')
        .then(res => res.json())
        .then(data => {
          const sorted = [...data].sort((a: Course, b: Course) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setCourses(sorted);
          if (sorted.length > 0) loadTeams(sorted[0].id);
        });
    } else {
      const sid = localStorage.getItem('tm_student_id');
      if (sid) {
        fetch(`http://localhost:8000/students/${sid}`)
          .then(res => res.json())
          .then(student => {
            if (student.course_id) loadTeams(student.course_id);
          });
      }
    }
  }, []);

  const loadTeams = async (cid: string) => {
    setError('');
    setLoading(true);
    setCourseId(cid);
    try {
      const res = await fetch(`http://localhost:8000/teams/course/${cid}`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      setTeams(data);

      const allStudentsRes = await fetch(`http://localhost:8000/students/course/${cid}`);
      const allStudents = await allStudentsRes.json();

      const studentMap: Record<string, Student[]> = {};
      data.forEach((team: Team) => {
        studentMap[team.id] = allStudents.filter((s: any) => s.team_id === team.id);
      });
      setStudentsByTeam(studentMap);

      const projectMap: Record<string, Project[]> = {};
      await Promise.all(
        data.map(async (team: Team) => {
          const pRes = await fetch(`http://localhost:8000/projects/team/${team.id}`);
          projectMap[team.id] = await pRes.json();
        })
      );
      setProjectsByTeam(projectMap);
    } catch (e) {
      setError('Could not load teams.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number | null) => {
    if (!score) return 'text-stone-400';
    if (score >= 0.8) return 'text-emerald-600';
    if (score >= 0.6) return 'text-amber-500';
    return 'text-red-500';
  };

  const scoreBar = (score: number | null) => {
    const pct = score ? Math.round(score * 100) : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-stone-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs font-mono ${scoreColor(score)}`}>{pct}%</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-1">Team Assignments</h1>
          <p className="text-stone-500 text-sm">View the generated teams and their balance scores.</p>
        </div>

        <div className="flex gap-6 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Course Selector (instructor only) */}
            {role === 'instructor' && courses.length > 1 && (
              <div className="flex gap-3 mb-6">
                <select
                  className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 transition text-sm"
                  value={courseId}
                  onChange={e => loadTeams(e.target.value)}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* No teams yet */}
            {teams.length === 0 && courseId && !loading && (
              <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
                <p className="text-stone-400">No teams found for this course yet.</p>
                <p className="text-stone-400 text-sm mt-1">Ask your instructor to run the team matching algorithm.</p>
              </div>
            )}

            {/* Teams Grid */}
            <div className="space-y-4">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">

              {/* Team Header */}
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{team.name?.charAt(team.name.length - 1) || '?'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">{team.name || 'Unnamed Team'}</h3>
                    <p className="text-xs text-stone-400 font-mono">Code: {team.team_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {team.overall_score && (
                    <div className="text-right">
                      <p className="text-xs text-stone-400 mb-0.5">Overall Score</p>
                      <p className={`text-lg font-bold ${scoreColor(team.overall_score)}`}>
                        {Math.round(team.overall_score * 100)}%
                      </p>
                    </div>
                  )}
                  <span className="text-stone-400 text-sm">{expandedTeam === team.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTeam === team.id && (
                <div className="border-t border-stone-100 px-6 py-5 space-y-5">

                  {/* Score Breakdown */}
                  {(team.skill_balance_score || team.schedule_overlap_score || team.experience_balance_score) && (
                    <div>
                      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Score Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-stone-500 w-40">Skill Balance</span>
                          {scoreBar(team.skill_balance_score)}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-stone-500 w-40">Schedule Overlap</span>
                          {scoreBar(team.schedule_overlap_score)}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-stone-500 w-40">Experience Balance</span>
                          {scoreBar(team.experience_balance_score)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Members */}
                  <div>
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">
                      Members ({studentsByTeam[team.id]?.length || 0})
                    </p>
                    {!studentsByTeam[team.id] || studentsByTeam[team.id].length === 0 ? (
                      <p className="text-sm text-stone-400">No members assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {studentsByTeam[team.id].map(student => (
                          <div key={student.id} className="flex items-center justify-between bg-stone-50 rounded-lg px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-stone-800">{student.name}</p>
                              <p className="text-xs text-stone-400">{student.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                student.experience_level === 'advanced' ? 'bg-emerald-100 text-emerald-700' :
                                student.experience_level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {student.experience_level}
                              </span>
                              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full capitalize">
                                {student.leadership_preference}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {team.explanation && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                      <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-2">Why this team?</p>
                      <p className="text-sm text-stone-600">{team.explanation}</p>
                    </div>
                  )}

                  {/* Assigned Projects */}
                  {projectsByTeam[team.id]?.length > 0 && (
                    <div>
                      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Assigned Project</p>
                      {projectsByTeam[team.id].map(project => (
                        <div key={project.id} className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-stone-800">{project.name}</p>
                              {project.description && (
                                <p className="text-sm text-stone-500 mt-0.5">{project.description}</p>
                              )}
                            </div>
                            {project.deadline && (
                              <span className="text-xs text-stone-400 whitespace-nowrap ml-4">
                                Due {new Date(project.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {project.milestones.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-stone-100">
                              {project.milestones.map(m => (
                                <div key={m.id} className="flex items-center gap-2">
                                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs flex-shrink-0 ${
                                    m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300'
                                  }`}>
                                    {m.completed && '✓'}
                                  </span>
                                  <span className={`text-sm ${m.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                                    {m.title}
                                  </span>
                                  {m.due_date && (
                                    <span className="text-xs text-stone-400 ml-auto">
                                      {new Date(m.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
            </div>{/* end teams grid */}

          </div>{/* end main content */}

          {/* Legend sidebar */}
          <div className="w-56 flex-shrink-0 sticky top-6 space-y-4">

            {/* Experience Level */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Experience</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">advanced</span>
                  <span className="text-xs text-stone-500">3+ years, owns features end-to-end</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700 whitespace-nowrap">intermediate</span>
                  <span className="text-xs text-stone-500">1–2 years, needs occasional guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-stone-100 text-stone-600 whitespace-nowrap">beginner</span>
                  <span className="text-xs text-stone-500">Learning the ropes, needs mentorship</span>
                </div>
              </div>
            </div>

            {/* Leadership */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Leadership</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-stone-100 text-stone-600">leader</span>
                  <p className="text-xs text-stone-500 mt-1">Drives decisions, coordinates the team</p>
                </div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-stone-100 text-stone-600">flexible</span>
                  <p className="text-xs text-stone-500 mt-1">Can lead or follow depending on the need</p>
                </div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-stone-100 text-stone-600">contributor</span>
                  <p className="text-xs text-stone-500 mt-1">Prefers to focus on execution, not coordination</p>
                </div>
              </div>
            </div>

            {/* Score Guide */}
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Score Guide</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500">80%+ — Well balanced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500">60–79% — Acceptable</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-xs text-stone-500">Below 60% — Review needed</span>
                </div>
              </div>
            </div>

          </div>{/* end legend */}

        </div>{/* end two-column */}
      </div>
    </div>
  );
}