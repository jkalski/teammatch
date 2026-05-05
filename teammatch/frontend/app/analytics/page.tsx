'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL;

const GOOD_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#0ea5e9', '#6366f1', '#14b8a6'];
const RISK_COLORS = ['#ef4444', '#f97316', '#f59e0b'];

interface CheckinPoint {
  week_number: number;
  hours_worked: number;
  confidence_level: number | null;
  completion_status: string | null;
  needs_help: boolean;
  blockers: string | null;
}

interface StudentInfo {
  id: string;
  name: string;
  experience_level: string;
}

interface TeamAnalyticsData {
  team: { id: string; name: string; overall_score: number | null };
  students: StudentInfo[];
  checkins_by_student: Record<string, CheckinPoint[]>;
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  return {
    slope: (n * sumXY - sumX * sumY) / denom,
    intercept: (sumY - (((n * sumXY - sumX * sumY) / denom) * sumX)) / n,
  };
}

function studentIsAtRisk(checkins: CheckinPoint[]) {
  if (!checkins.length) return false;
  const latest = [...checkins].sort((a, b) => b.week_number - a.week_number)[0];
  return latest.completion_status === 'behind' || latest.completion_status === 'blocked' || latest.needs_help;
}

export default function AnalyticsPage() {
  const [courses, setCourses] = useState<{ id: string; name: string; created_at: string }[]>([]);
  const [courseId, setCourseId] = useState('');
  const [analyticsData, setAnalyticsData] = useState<TeamAnalyticsData[]>([]);
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [runningAI, setRunningAI] = useState<Set<string>>(new Set());
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    fetch(`${API}/courses/`)
      .then(r => r.json())
      .then((data: { id: string; name: string; created_at: string }[]) => {
        const sorted = [...data].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCourses(sorted);
        if (sorted.length > 0) setCourseId(sorted[0].id);
      });
  }, []);

  const runReport = async () => {
    if (!courseId) return;
    setLoading(true);
    setAnalyticsData([]);
    setAiAnalyses({});
    setHasRun(false);
    try {
      const res = await fetch(`${API}/analytics/course/${courseId}`);
      const data: TeamAnalyticsData[] = await res.json();
      setAnalyticsData(data);
      setHasRun(true);

      const ids = new Set(data.map(d => d.team.id));
      setRunningAI(ids);

      await Promise.all(
        data.map(async teamData => {
          try {
            const r = await fetch(`${API}/teams/${teamData.team.id}/analyze`, { method: 'POST' });
            const result = await r.json();
            setAiAnalyses(prev => ({ ...prev, [teamData.team.id]: result.analysis }));
          } catch {
            setAiAnalyses(prev => ({ ...prev, [teamData.team.id]: 'Analysis unavailable.' }));
          } finally {
            setRunningAI(prev => { const n = new Set(prev); n.delete(teamData.team.id); return n; });
          }
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const formatInline = (line: string) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, j) =>
      j % 2 === 1
        ? <strong key={j} className="font-semibold text-stone-800">{part}</strong>
        : part
    );
  };

  const renderAnalysis = (text: string) => {
    const sections = text.split(/\n(?=## )/);
    return sections.map((section, i) => {
      const lines = section.trim().split('\n');
      const header = lines[0].replace(/^## /, '');
      const bodyLines = lines.slice(1).filter(l => l.trim());
      return (
        <div key={i} className="mb-4 last:mb-0">
          <p className="text-xs font-mono text-purple-600 uppercase tracking-widest mb-2">{header}</p>
          <div className="space-y-1.5">
            {bodyLines.map((line, j) => {
              const isBullet = /^[-*]\s/.test(line) || /^\d+\.\s/.test(line);
              const cleaned = line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
              if (isBullet) {
                return (
                  <div key={j} className="flex gap-2 items-start">
                    <span className="text-purple-400 flex-shrink-0 mt-0.5">•</span>
                    <p className="text-sm text-stone-700">{formatInline(cleaned)}</p>
                  </div>
                );
              }
              return <p key={j} className="text-sm text-stone-700">{formatInline(line)}</p>;
            })}
          </div>
        </div>
      );
    });
  };

  const scoreColor = (score: number | null) => {
    if (!score) return 'text-stone-400';
    if (score >= 0.8) return 'text-emerald-600';
    if (score >= 0.6) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-1">Analytics & Reports</h1>
            <p className="text-stone-500 text-sm">Check-in trends and AI health reports for every team.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-emerald-400 transition"
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              onClick={runReport}
              disabled={loading || !courseId}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : 'Run Report'}
            </button>
          </div>
        </div>

        {/* Team report cards */}
        {hasRun && analyticsData.map(teamData => {
          // Collect all weeks
          const weekSet = new Set<number>();
          Object.values(teamData.checkins_by_student).forEach(cks =>
            cks.forEach(c => weekSet.add(c.week_number))
          );
          const weeks = Array.from(weekSet).sort((a, b) => a - b);

          // Build chart data: one row per week
          const chartData: Record<string, number | string>[] = weeks.map(week => {
            const row: Record<string, number | string> = { week: `Wk ${week}` };
            teamData.students.forEach(s => {
              const c = teamData.checkins_by_student[s.id]?.find(c => c.week_number === week);
              if (c !== undefined) row[s.name] = c.hours_worked;
            });
            return row;
          });

          // Linear regression on team average
          const avgPoints = weeks.map((week, idx) => {
            const vals = teamData.students
              .map(s => teamData.checkins_by_student[s.id]?.find(c => c.week_number === week)?.hours_worked)
              .filter((v): v is number => v !== undefined);
            return { x: idx, y: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
          });
          const reg = linearRegression(avgPoints);
          if (reg) {
            const { slope, intercept } = reg;
            chartData.forEach((row, i) => {
              row['Avg Trend'] = Math.round((slope * i + intercept) * 10) / 10;
            });
          }

          // Assign colors based on at-risk status
          let goodIdx = 0, riskIdx = 0;
          const studentColors: Record<string, string> = {};
          teamData.students.forEach(s => {
            const cks = teamData.checkins_by_student[s.id] || [];
            studentColors[s.name] = studentIsAtRisk(cks)
              ? RISK_COLORS[riskIdx++ % RISK_COLORS.length]
              : GOOD_COLORS[goodIdx++ % GOOD_COLORS.length];
          });

          const aiText = aiAnalyses[teamData.team.id];
          const aiLoading = runningAI.has(teamData.team.id);

          return (
            <div key={teamData.team.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">

              {/* Team header */}
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">{teamData.team.name?.slice(-1)}</span>
                  </div>
                  <h2 className="font-semibold text-stone-800">{teamData.team.name}</h2>
                </div>
                {teamData.team.overall_score !== null && (
                  <span className={`text-sm font-bold ${scoreColor(teamData.team.overall_score)}`}>
                    {Math.round((teamData.team.overall_score ?? 0) * 100)}% match score
                  </span>
                )}
              </div>

              <div className="p-6 space-y-6">

                {/* Line chart */}
                {weeks.length > 0 ? (
                  <div>
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-4">Hours Worked Per Week</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#78716c' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#78716c' }} unit="h" width={32} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
                        />
                        {teamData.students.map(s => (
                          <Line
                            key={s.id}
                            type="monotone"
                            dataKey={s.name}
                            stroke={studentColors[s.name]}
                            strokeWidth={2}
                            dot={{ r: 4, fill: studentColors[s.name] }}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        ))}
                        {reg && (
                          <Line
                            type="linear"
                            dataKey="Avg Trend"
                            stroke="#a8a29e"
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            dot={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Student legend */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                      {teamData.students.map(s => {
                        const cks = teamData.checkins_by_student[s.id] || [];
                        const atRisk = studentIsAtRisk(cks);
                        const latest = cks.length
                          ? [...cks].sort((a, b) => b.week_number - a.week_number)[0]
                          : null;
                        return (
                          <div key={s.id} className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: studentColors[s.name] }} />
                            <span className="text-xs text-stone-600">{s.name}</span>
                            {atRisk && latest && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                                {latest.needs_help ? 'needs help' : latest.completion_status}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {reg && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block w-5 border-t-2 border-dashed border-stone-400" />
                          <span className="text-xs text-stone-400">avg trend</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-400">No check-in data for this team yet.</p>
                )}

                {/* AI analysis */}
                <div className="border-t border-stone-100 pt-5">
                  <p className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">AI Health Report</p>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <span className="w-4 h-4 border-2 border-stone-300 border-t-purple-400 rounded-full animate-spin" />
                      Generating report...
                    </div>
                  ) : aiText ? (
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                      {renderAnalysis(aiText)}
                    </div>
                  ) : null}
                </div>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
