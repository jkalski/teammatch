'use client';

import { useState, useEffect } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
}

interface Project {
  id: string;
  course_id: string;
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

interface Team {
  id: string;
  name: string;
}

interface CheckIn {
  id: string;
  student_id: string;
  team_id: string;
  hours_worked: number;
  tasks_planned: string | null;
  tasks_completed: string;
  what_i_worked_on: string;
  next_week_plan: string | null;
  confidence_level: number | null;
  contribution_type: string | null;
  needs_help: boolean;
  blockers: string | null;
  blocked_by: string | null;
  completion_status: string | null;
  peer_shoutout: string | null;
  evidence_url: string | null;
  week_number: number;
  is_edited: boolean;
  created_at: string;
}

interface Student {
  id: string;
  name: string;
}

const PHASES: { label: string; keywords: string[]; color: string }[] = [
  { label: 'Planning', keywords: ['prd', 'trd', 'research', 'competitive', 'requirements'], color: 'bg-violet-100 text-violet-700' },
  { label: 'Design', keywords: ['wireframe', 'mockup', 'component', 'prototype', 'accessibility', 'information architecture', 'design system', 'ui'], color: 'bg-blue-100 text-blue-700' },
  { label: 'Architecture', keywords: ['schema', 'erd', 'api spec', 'database'], color: 'bg-amber-100 text-amber-700' },
  { label: 'Development', keywords: ['backend', 'frontend', 'matching', 'ai analytics', 'integration'], color: 'bg-emerald-100 text-emerald-700' },
  { label: 'Launch', keywords: ['testing', 'uat', 'deployment', 'demo', 'acceptance'], color: 'bg-red-100 text-red-700' },
];

function getPhase(title: string) {
  const lower = title.toLowerCase();
  return PHASES.find(p => p.keywords.some(k => lower.includes(k))) ?? { label: 'General', color: 'bg-stone-100 text-stone-600' };
}

export default function ProjectsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '' });
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' });

  // Milestone progress panel
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamCheckins, setTeamCheckins] = useState<Record<string, CheckIn[]>>({});
  const [, setStudents] = useState<Record<string, Student>>({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<CheckIn | null>(null);
  const [studentMap, setStudentMap] = useState<Record<string, Student>>({});

  useEffect(() => {
    fetch('http://localhost:8000/courses/')
      .then(r => r.json())
      .then(data => {
        const sorted = [...data].sort((a: Course, b: Course) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        );
        setCourses(sorted);
        if (sorted.length > 0) setSelectedCourse(sorted[0]);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setExpandedMilestone(null);
    setTeamCheckins({});

    fetch(`http://localhost:8000/projects/course/${selectedCourse.id}`)
      .then(r => r.json())
      .then(data => {
        setProjects(data);
        setSelectedProject(data[0] ?? null);
      });

    fetch(`http://localhost:8000/teams/course/${selectedCourse.id}`)
      .then(r => r.json())
      .then(setTeams);

    fetch(`http://localhost:8000/students/course/${selectedCourse.id}`)
      .then(r => r.json())
      .then((data: Student[]) => {
        const map: Record<string, Student> = {};
        data.forEach(s => { map[s.id] = s; });
        setStudents(map);
        setStudentMap(map);
      });
  }, [selectedCourse]);

  const sortedMilestones = (milestones: Milestone[]) =>
    [...milestones].sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const handleMilestoneClick = async (milestone: Milestone) => {
    if (expandedMilestone === milestone.id) {
      setExpandedMilestone(null);
      return;
    }
    setExpandedMilestone(milestone.id);
    if (teamCheckins[milestone.id]) return;

    setProgressLoading(true);
    const checkinsByTeam: Record<string, CheckIn[]> = {};

    await Promise.all(
      teams.map(async team => {
        const res = await fetch(`http://localhost:8000/checkins/team/${team.id}`);
        const all: CheckIn[] = await res.json();

        const sorted = sortedMilestones(selectedProject?.milestones ?? []);
        const idx = sorted.findIndex(m => m.id === milestone.id);
        const prevDate = idx > 0 && sorted[idx - 1].due_date
          ? new Date(sorted[idx - 1].due_date!)
          : new Date('2000-01-01');
        const thisDate = milestone.due_date ? new Date(milestone.due_date) : new Date();

        checkinsByTeam[team.id] = all.filter(c => {
          const d = new Date(c.created_at);
          return d >= prevDate && d <= thisDate;
        });
      })
    );

    setTeamCheckins(prev => ({ ...prev, [milestone.id]: [] }));
    // flatten into milestone key for lookup
    const flat: CheckIn[] = Object.values(checkinsByTeam).flat();
    setTeamCheckins(prev => ({ ...prev, [milestone.id]: flat }));

    // also store per-team for display
    setTeamCheckins(prev => {
      const next = { ...prev };
      teams.forEach(t => {
        next[`${milestone.id}:${t.id}`] = checkinsByTeam[t.id] ?? [];
      });
      return next;
    });

    setProgressLoading(false);
  };

  const createProject = async () => {
    if (!selectedCourse || !newProject.name) return;
    setLoading(true);
    const res = await fetch('http://localhost:8000/projects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: selectedCourse.id,
        name: newProject.name,
        description: newProject.description || null,
        deadline: newProject.deadline || null,
      }),
    });
    const data = await res.json();
    setProjects(prev => [...prev, data]);
    setSelectedProject(data);
    setShowCreateProject(false);
    setNewProject({ name: '', description: '', deadline: '' });
    setLoading(false);
  };

  const addMilestone = async () => {
    if (!selectedProject || !newMilestone.title) return;
    setLoading(true);
    const res = await fetch(`http://localhost:8000/projects/${selectedProject.id}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newMilestone.title,
        description: newMilestone.description || null,
        due_date: newMilestone.due_date || null,
      }),
    });
    const data = await res.json();
    const updated = { ...selectedProject, milestones: [...selectedProject.milestones, data] };
    setSelectedProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setShowAddMilestone(false);
    setNewMilestone({ title: '', description: '', due_date: '' });
    setLoading(false);
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    const res = await fetch(`http://localhost:8000/projects/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    const data = await res.json();
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      milestones: selectedProject.milestones.map(m => m.id === data.id ? data : m),
    };
    setSelectedProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const completedCount = selectedProject ? selectedProject.milestones.filter(m => m.completed).length : 0;
  const totalCount = selectedProject?.milestones.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-stone-50">

      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <span className="text-sm text-stone-500 font-medium">Project Management</span>
        <button
          onClick={() => setShowCreateProject(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition"
        >
          + New Project
        </button>
      </div>

      <div className="flex h-[calc(100vh-113px)]">

        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-stone-200 overflow-y-auto">
          <div className="p-4">
            <p className="text-xs font-mono text-stone-400 tracking-widest uppercase mb-2">Course</p>
            <select
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 text-stone-700 bg-stone-50 mb-4"
              value={selectedCourse?.id ?? ''}
              onChange={e => {
                const c = courses.find(c => c.id === e.target.value) ?? null;
                setSelectedCourse(c);
                setSelectedProject(null);
              }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <p className="text-xs font-mono text-stone-400 tracking-widest uppercase mb-3">Projects</p>
            {projects.length === 0 && <p className="text-sm text-stone-400">No projects yet.</p>}
            {projects.map(project => {
              const done = project.milestones.filter(m => m.completed).length;
              const total = project.milestones.length;
              return (
                <button
                  key={project.id}
                  onClick={() => { setSelectedProject(project); setExpandedMilestone(null); }}
                  className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition ${
                    selectedProject?.id === project.id
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <p className={`text-sm font-medium ${selectedProject?.id === project.id ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {project.name}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{done}/{total} milestones</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8 pr-4 flex gap-6">
          <div className="flex-1 min-w-0">
          {!selectedProject ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-stone-400 mb-4">No project selected</p>
                <button onClick={() => setShowCreateProject(true)} className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg">
                  Create your first project
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl">

              {/* Project header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-stone-800 mb-1">{selectedProject.name}</h1>
                {selectedProject.description && (
                  <p className="text-stone-500 text-sm mb-3">{selectedProject.description}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  {selectedProject.deadline && (
                    <span className="text-sm text-stone-500">
                      Deadline: <strong>{new Date(selectedProject.deadline).toLocaleDateString()}</strong>
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    selectedProject.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {selectedProject.status}
                  </span>
                  <span className="text-xs text-stone-400">{teams.length} team{teams.length !== 1 ? 's' : ''} assigned</span>
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">Overall Progress</p>
                  <span className="text-sm font-bold text-stone-700">{completedCount}/{totalCount} milestones</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400 mt-1.5">{progressPct}% complete</p>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">Milestones</p>
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-500 border border-emerald-200 px-3 py-1 rounded-lg transition"
                  >
                    + Add
                  </button>
                </div>

                {selectedProject.milestones.length === 0 ? (
                  <p className="text-sm text-stone-400">No milestones yet.</p>
                ) : (
                  <div className="space-y-1">
                    {sortedMilestones(selectedProject.milestones).map((m, idx, arr) => {
                      const phase = getPhase(m.title);
                      const isExpanded = expandedMilestone === m.id;
                      const isOverdue = !m.completed && m.due_date && new Date(m.due_date) < new Date();
                      const perTeamKey = (teamId: string) => `${m.id}:${teamId}`;

                      return (
                        <div key={m.id}>
                          {/* Phase label — show when phase changes */}
                          {(idx === 0 || getPhase(arr[idx - 1].title).label !== phase.label) && (
                            <div className="pt-4 pb-2 first:pt-0">
                              <span className={`text-xs font-mono px-2 py-0.5 rounded font-medium ${phase.color}`}>
                                {phase.label}
                              </span>
                            </div>
                          )}

                          {/* Milestone row */}
                          <div
                            className={`rounded-lg border transition-all ${
                              isExpanded ? 'border-emerald-200 bg-emerald-50/40' : 'border-transparent hover:border-stone-100 hover:bg-stone-50'
                            }`}
                          >
                            <div
                              className="flex items-start gap-3 px-3 py-3 cursor-pointer"
                              onClick={() => handleMilestoneClick(m)}
                            >
                              {/* Checkbox */}
                              <button
                                onClick={e => { e.stopPropagation(); toggleMilestone(m.id, !m.completed); }}
                                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                                  m.completed ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-emerald-400'
                                }`}
                              >
                                {m.completed && <span className="text-white text-xs">✓</span>}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${m.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                                  {m.title}
                                </p>
                                {m.description && (
                                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{m.description}</p>
                                )}
                                {m.due_date && (
                                  <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-stone-400'}`}>
                                    {isOverdue ? 'Overdue · ' : ''}Due {new Date(m.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                )}
                              </div>

                              <span className="text-stone-300 text-xs ml-2 flex-shrink-0 mt-1">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>

                            {/* Progress panel */}
                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-emerald-100 mt-1 pt-4">
                                <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Team Check-in Progress</p>

                                {progressLoading ? (
                                  <p className="text-sm text-stone-400">Loading...</p>
                                ) : teams.length === 0 ? (
                                  <p className="text-sm text-stone-400">No teams assigned yet. Run a match first.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {teams.map(team => {
                                      const checkins = teamCheckins[perTeamKey(team.id)] ?? [];
                                      const avgHours = checkins.length > 0
                                        ? Math.round(checkins.reduce((s, c) => s + c.hours_worked, 0) / checkins.length)
                                        : 0;
                                      const avgConf = checkins.filter(c => c.confidence_level).length > 0
                                        ? (checkins.reduce((s, c) => s + (c.confidence_level ?? 0), 0) / checkins.filter(c => c.confidence_level).length).toFixed(1)
                                        : '—';
                                      const blocked = checkins.filter(c => c.needs_help || c.blockers).length;

                                      return (
                                        <div key={team.id} className="bg-white rounded-lg border border-stone-200 px-4 py-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-stone-700">{team.name}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                              checkins.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                                            }`}>
                                              {checkins.length} check-in{checkins.length !== 1 ? 's' : ''}
                                            </span>
                                          </div>

                                          {checkins.length === 0 ? (
                                            <p className="text-xs text-stone-400">No check-ins submitted for this milestone period.</p>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-3 gap-3 mb-3">
                                                <div>
                                                  <p className="text-xs text-stone-400">Avg Hours</p>
                                                  <p className="text-sm font-semibold text-stone-700">{avgHours}h</p>
                                                </div>
                                                <div>
                                                  <p className="text-xs text-stone-400">Confidence</p>
                                                  <p className="text-sm font-semibold text-stone-700">{avgConf}/5</p>
                                                </div>
                                                <div>
                                                  <p className="text-xs text-stone-400">Needs Help</p>
                                                  <p className={`text-sm font-semibold ${blocked > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {blocked > 0 ? `${blocked} member${blocked !== 1 ? 's' : ''}` : 'None'}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="border-t border-stone-100 pt-2 space-y-1">
                                                {checkins.map(ci => (
                                                  <button
                                                    key={ci.id}
                                                    onClick={() => setSelectedCheckin(ci)}
                                                    className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded hover:bg-stone-50 transition group"
                                                  >
                                                    <span className="text-xs text-stone-600 group-hover:text-stone-800">
                                                      Wk {ci.week_number} · {ci.hours_worked}h
                                                      {ci.confidence_level != null && ` · conf ${ci.confidence_level}/5`}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                      {ci.needs_help && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">help</span>
                                                      )}
                                                      {ci.completion_status && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                          ci.completion_status === 'on_track' ? 'bg-emerald-100 text-emerald-700' :
                                                          ci.completion_status === 'ahead' ? 'bg-blue-100 text-blue-700' :
                                                          ci.completion_status === 'behind' ? 'bg-amber-100 text-amber-700' :
                                                          'bg-red-100 text-red-700'
                                                        }`}>{ci.completion_status.replace('_', ' ')}</span>
                                                      )}
                                                      <span className="text-stone-300 text-xs">→</span>
                                                    </span>
                                                  </button>
                                                ))}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
          </div>{/* end flex-1 min-w-0 */}

          {/* Legend sidebar */}
          <div className="w-56 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-xl border border-stone-200 p-4 space-y-5 text-xs">

              <div>
                <p className="font-mono text-stone-400 uppercase tracking-widest mb-2">Phases</p>
                <div className="space-y-1.5">
                  {PHASES.map(p => (
                    <div key={p.label} className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-medium ${p.color}`}>{p.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-medium bg-stone-100 text-stone-600">General</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-mono text-stone-400 uppercase tracking-widest mb-2">Milestone Status</p>
                <div className="space-y-2 text-stone-600">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border-2 bg-emerald-500 border-emerald-500 flex items-center justify-center text-white text-[9px]">✓</span>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border-2 border-stone-300 flex-shrink-0" />
                    <span>In progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 ml-1" />
                    <span className="text-red-500 font-medium">Overdue</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-mono text-stone-400 uppercase tracking-widest mb-2">Check-in Metrics</p>
                <div className="space-y-2 text-stone-600">
                  <div>
                    <p className="font-medium text-stone-700">Avg Hours</p>
                    <p className="text-stone-400 leading-tight">Mean hours worked per member during this milestone period.</p>
                  </div>
                  <div>
                    <p className="font-medium text-stone-700">Confidence</p>
                    <p className="text-stone-400 leading-tight">Self-reported 1–5 scale. ≥4 is on track; ≤2 may need attention.</p>
                  </div>
                  <div>
                    <p className="font-medium text-stone-700">Needs Help</p>
                    <p className="text-stone-400 leading-tight">Members who flagged a blocker or requested assistance in their check-in.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-stone-800 mb-4">New Project</h2>
            <div className="space-y-3">
              <input
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 transition"
                placeholder="Project name"
                value={newProject.name}
                onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
              />
              <textarea
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 transition resize-none"
                placeholder="Description (optional)"
                rows={3}
                value={newProject.description}
                onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
              />
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Deadline</label>
                <input
                  type="date"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 transition"
                  value={newProject.deadline}
                  onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateProject(false)} className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition">Cancel</button>
              <button onClick={createProject} disabled={loading || !newProject.name} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 text-white text-sm font-medium rounded-lg transition">
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-stone-800 mb-4">Add Milestone</h2>
            <div className="space-y-3">
              <input
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 transition"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={e => setNewMilestone(p => ({ ...p, title: e.target.value }))}
              />
              <input
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-400 transition"
                placeholder="Description (optional)"
                value={newMilestone.description}
                onChange={e => setNewMilestone(p => ({ ...p, description: e.target.value }))}
              />
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Due date</label>
                <input
                  type="date"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 transition"
                  value={newMilestone.due_date}
                  onChange={e => setNewMilestone(p => ({ ...p, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddMilestone(false)} className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition">Cancel</button>
              <button onClick={addMilestone} disabled={loading || !newMilestone.title} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 text-white text-sm font-medium rounded-lg transition">
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in detail modal */}
      {selectedCheckin && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCheckin(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-stone-100">
              <div>
                <p className="text-lg font-bold text-stone-800">
                  {studentMap[selectedCheckin.student_id]?.name ?? 'Check-in'}
                </p>
                <p className="text-sm text-stone-400 mt-0.5">
                  Week {selectedCheckin.week_number} · {new Date(selectedCheckin.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{selectedCheckin.is_edited ? ' · edited' : ''}
                </p>
              </div>
              <button onClick={() => setSelectedCheckin(null)} className="text-stone-300 hover:text-stone-500 text-xl leading-none ml-4">×</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">Hours</p>
                  <p className="text-lg font-bold text-stone-700">{selectedCheckin.hours_worked}h</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">Confidence</p>
                  <p className={`text-lg font-bold ${
                    !selectedCheckin.confidence_level ? 'text-stone-400' :
                    selectedCheckin.confidence_level >= 4 ? 'text-emerald-600' :
                    selectedCheckin.confidence_level === 3 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {selectedCheckin.confidence_level != null ? `${selectedCheckin.confidence_level}/5` : '—'}
                  </p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">Status</p>
                  {selectedCheckin.completion_status ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedCheckin.completion_status === 'on_track' ? 'bg-emerald-100 text-emerald-700' :
                      selectedCheckin.completion_status === 'ahead' ? 'bg-blue-100 text-blue-700' :
                      selectedCheckin.completion_status === 'behind' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{selectedCheckin.completion_status.replace('_', ' ')}</span>
                  ) : <p className="text-sm text-stone-400">—</p>}
                </div>
              </div>

              {selectedCheckin.what_i_worked_on && (
                <CheckinField label="What I worked on" value={selectedCheckin.what_i_worked_on} />
              )}
              {selectedCheckin.tasks_completed && (
                <CheckinField label="Tasks completed" value={selectedCheckin.tasks_completed} />
              )}
              {selectedCheckin.tasks_planned && (
                <CheckinField label="Tasks planned" value={selectedCheckin.tasks_planned} />
              )}
              {selectedCheckin.next_week_plan && (
                <CheckinField label="Next week plan" value={selectedCheckin.next_week_plan} />
              )}
              {selectedCheckin.contribution_type && (
                <CheckinField label="Contribution type" value={selectedCheckin.contribution_type} />
              )}
              {(selectedCheckin.needs_help || selectedCheckin.blockers || selectedCheckin.blocked_by) && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-1">
                  <p className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2">Needs Help</p>
                  {selectedCheckin.blockers && <p className="text-sm text-stone-700">{selectedCheckin.blockers}</p>}
                  {selectedCheckin.blocked_by && <p className="text-sm text-stone-500">Blocked by: {selectedCheckin.blocked_by}</p>}
                </div>
              )}
              {selectedCheckin.peer_shoutout && (
                <CheckinField label="Peer shoutout" value={selectedCheckin.peer_shoutout} />
              )}
              {selectedCheckin.evidence_url && (
                <div>
                  <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Evidence</p>
                  <a href={selectedCheckin.evidence_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline break-all">
                    {selectedCheckin.evidence_url}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function CheckinField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-stone-700 leading-relaxed">{value}</p>
    </div>
  );
}
