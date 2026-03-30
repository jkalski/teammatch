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
  team_id: string | null;
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
}

interface Team {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '' });
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' });

  useEffect(() => {
    fetch('http://localhost:8000/courses/')
      .then(r => r.json())
      .then(data => {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    fetch(`http://localhost:8000/projects/course/${selectedCourse.id}`)
      .then(r => r.json())
      .then(data => {
        setProjects(data);
        setSelectedProject(data[0] ?? null);
      });
    fetch(`http://localhost:8000/teams/course/${selectedCourse.id}`)
      .then(r => r.json())
      .then(setTeams);
  }, [selectedCourse]);

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

  const assignTeam = async (projectId: string, teamId: string) => {
    const res = await fetch(`http://localhost:8000/projects/${projectId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId }),
    });
    const data = await res.json();
    setProjects(prev => prev.map(p => p.id === data.id ? data : p));
    setSelectedProject(data);
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

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Nav */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-xs font-mono text-stone-400 hover:text-stone-600 transition">← Dashboard</a>
          <span className="text-stone-300">|</span>
          <span className="text-xs font-mono text-emerald-600 tracking-widest uppercase">TeamMatch</span>
          <span className="text-stone-300">|</span>
          <span className="text-sm text-stone-500">Project Management</span>
        </div>
        <button
          onClick={() => setShowCreateProject(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition"
        >
          + New Project
        </button>
      </div>

      <div className="flex h-[calc(100vh-57px)]">

        {/* Sidebar — Course + Project list */}
        <div className="w-64 bg-white border-r border-stone-200 overflow-y-auto">
          <div className="p-4">
            {/* Course selector */}
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
            {projects.length === 0 && (
              <p className="text-sm text-stone-400">No projects yet.</p>
            )}
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition ${
                  selectedProject?.id === project.id
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'hover:bg-stone-50'
                }`}
              >
                <p className={`text-sm font-medium ${selectedProject?.id === project.id ? 'text-emerald-700' : 'text-stone-700'}`}>
                  {project.name}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {project.team_id ? `Assigned` : 'Unassigned'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedProject ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-stone-400 mb-4">No project selected</p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg"
                >
                  Create your first project
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl">

              {/* Project header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-stone-800 mb-1">{selectedProject.name}</h1>
                {selectedProject.description && (
                  <p className="text-stone-500 mb-3">{selectedProject.description}</p>
                )}
                <div className="flex gap-4 flex-wrap">
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
                </div>
              </div>

              {/* Assign team */}
              <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
                <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Assigned Team</p>
                {teams.length === 0 ? (
                  <p className="text-sm text-stone-400">No teams available. Run a match first.</p>
                ) : (
                  <select
                    className="text-sm border border-stone-200 rounded-lg px-3 py-2 text-stone-700 bg-stone-50"
                    value={selectedProject.team_id ?? ''}
                    onChange={e => assignTeam(selectedProject.id, e.target.value)}
                  >
                    <option value="">— Unassigned —</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
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
                  <div className="space-y-3">
                    {selectedProject.milestones.map(m => (
                      <div key={m.id} className="flex items-start gap-3">
                        <button
                          onClick={() => toggleMilestone(m.id, !m.completed)}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                            m.completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-stone-300 hover:border-emerald-400'
                          }`}
                        >
                          {m.completed && <span className="text-white text-xs">✓</span>}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${m.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="text-xs text-stone-400 mt-0.5">{m.description}</p>
                          )}
                          {m.due_date && (
                            <p className="text-xs text-stone-400 mt-0.5">Due: {new Date(m.due_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
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
                <label className="text-xs text-stone-400 mb-1 block">Deadline (optional)</label>
                <input
                  type="date"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 transition"
                  value={newProject.deadline}
                  onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateProject(false)}
                className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={loading || !newProject.name}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 text-white text-sm font-medium rounded-lg transition"
              >
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
                <label className="text-xs text-stone-400 mb-1 block">Due date (optional)</label>
                <input
                  type="date"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 transition"
                  value={newMilestone.due_date}
                  onChange={e => setNewMilestone(p => ({ ...p, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMilestone(false)}
                className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addMilestone}
                disabled={loading || !newMilestone.title}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-200 text-white text-sm font-medium rounded-lg transition"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
