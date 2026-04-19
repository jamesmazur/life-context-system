"use client";

import { useExperiments, useObservations, useProjects, useSessions } from "@/hooks/useApi";
import Link from "next/link";
import Header from "@/components/Header";

export default function Dashboard() {
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useProjects({ status: "active" });
  const { data: observations, error: observationsError, isLoading: observationsLoading } = useObservations({ status: "active" });
  const { data: experiments, error: experimentsError, isLoading: experimentsLoading } = useExperiments({ status: "running" });
  const { data: sessions, error: sessionsError, isLoading: sessionsLoading } = useSessions({ limit: 1 });

  const isLoading = projectsLoading || observationsLoading || experimentsLoading || sessionsLoading;
  const error = projectsError || observationsError || experimentsError || sessionsError;

  const lastSession = sessions?.[0] ?? null;
  const pendingFollowups = lastSession?.followup_needed ? (lastSession.followup_items ?? []) : [];

  const context = {
    active_projects: projects ?? [],
    recent_observations: observations ?? [],
    running_experiments: experiments ?? [],
    pending_followups: pendingFollowups,
    last_session: lastSession,
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !context) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold">Failed to load dashboard</p>
            <p className="text-gray-600 mt-2">Make sure the backend is running on http://localhost:8000</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Active Projects</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{context.active_projects.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Active Observations</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{context.recent_observations.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Running Experiments</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{context.running_experiments.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Pending Followups</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{context.pending_followups.length}</div>
          </div>
        </div>

        {/* Pending Followups */}
        {context.pending_followups.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-3">⚡ Pending Followups</h2>
            <ul className="space-y-2">
              {context.pending_followups.map((item, idx) => (
                <li key={idx} className="text-yellow-800">• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Observations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">💡 Recent Observations</h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {context.recent_observations.slice(0, 5).map((obs) => (
                <div key={obs.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{obs.type}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{Math.round(obs.confidence * 100)}% confidence</span>
                  </div>
                  <p className="text-sm text-gray-900">{obs.content}</p>
                  {obs.tags && obs.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {obs.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-gray-200">
              <Link href="/observations" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all observations →
              </Link>
            </div>
          </div>

          {/* Last Session */}
          {context.last_session && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">📝 Last Session</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Started</div>
                  <div className="text-sm text-gray-900">
                    {new Date(context.last_session.started_at).toLocaleString()}
                  </div>
                </div>
                {context.last_session.summary && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Summary</div>
                    <p className="text-sm text-gray-900">{context.last_session.summary}</p>
                  </div>
                )}
                {context.last_session.session_observations && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Session Observations</div>
                    <p className="text-sm text-gray-700 italic">{context.last_session.session_observations}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Projects */}
        {context.active_projects.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🎯 Active Projects</h2>
            </div>
            <div className="p-6 space-y-4">
              {context.active_projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        {project.priority && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                            P{project.priority}
                          </span>
                        )}
                      </div>
                      {project.current_phase && (
                        <p className="text-sm text-gray-600 mb-2">Phase: {project.current_phase}</p>
                      )}
                      {project.next_action && (
                        <p className="text-sm text-gray-900 mb-2">
                          <span className="font-medium">Next:</span> {project.next_action}
                        </p>
                      )}
                      {project.blockers && project.blockers.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-red-600">Blockers:</span>
                          <ul className="text-sm text-red-700 mt-1 space-y-1">
                            {project.blockers.map((blocker, idx) => (
                              <li key={idx}>• {blocker}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
