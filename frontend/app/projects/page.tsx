"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useApi";
import Header from "@/components/Header";

export default function ProjectsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const queryParams: { status?: string } = {};
  if (selectedStatus !== "all") queryParams.status = selectedStatus;

  const { data: projects, error, isLoading } = useProjects(queryParams);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold">Failed to load projects</p>
          </div>
        </main>
      </>
    );
  }

  const groupedProjects = {
    active: projects?.filter(p => p.status === "active") || [],
    paused: projects?.filter(p => p.status === "paused") || [],
    completed: projects?.filter(p => p.status === "completed") || [],
    abandoned: projects?.filter(p => p.status === "abandoned") || [],
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Projects</h2>
          <p className="text-gray-600">Active initiatives and goals you&apos;re working towards</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {projects?.length || 0} project{projects?.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Projects by Status */}
        <div className="space-y-8">
          {!projects || projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500">
                {selectedStatus === "all"
                  ? "Projects will appear here as they are created in the system."
                  : `No ${selectedStatus} projects found.`}
              </p>
            </div>
          ) : (
            <>
              {groupedProjects.active.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>🎯</span>
                      <span>Active Projects</span>
                      <span className="text-sm font-normal text-gray-500">({groupedProjects.active.length})</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {groupedProjects.active.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{project.name}</h4>
                              {project.priority && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                  P{project.priority}
                                </span>
                              )}
                            </div>
                            {project.current_phase && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Phase:</span> {project.current_phase}
                              </p>
                            )}
                            {project.next_action && (
                              <p className="text-sm text-gray-900 mb-2">
                                <span className="font-medium">Next Action:</span> {project.next_action}
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
                            {project.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">{project.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Started: {new Date(project.started_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupedProjects.paused.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>⏸️</span>
                      <span>Paused Projects</span>
                      <span className="text-sm font-normal text-gray-500">({groupedProjects.paused.length})</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {groupedProjects.paused.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
                        {project.notes && <p className="text-sm text-gray-600 italic">{project.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupedProjects.completed.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>✅</span>
                      <span>Completed Projects</span>
                      <span className="text-sm font-normal text-gray-500">({groupedProjects.completed.length})</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {groupedProjects.completed.map((project) => (
                      <div key={project.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
                        {project.completed_at && (
                          <p className="text-xs text-gray-600">
                            Completed: {new Date(project.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
