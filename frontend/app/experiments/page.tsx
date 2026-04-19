"use client";

import { useState } from "react";
import { useExperiments } from "@/hooks/useApi";
import Header from "@/components/Header";

export default function ExperimentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const queryParams: { status?: string } = {};
  if (selectedStatus !== "all") queryParams.status = selectedStatus;

  const { data: experiments, error, isLoading } = useExperiments(queryParams);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading experiments...</p>
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
            <p className="text-red-600 font-semibold">Failed to load experiments</p>
          </div>
        </main>
      </>
    );
  }

  const groupedExperiments = {
    running: experiments?.filter(e => e.status === "running") || [],
    completed: experiments?.filter(e => e.status === "completed") || [],
    abandoned: experiments?.filter(e => e.status === "abandoned") || [],
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Experiments</h2>
          <p className="text-gray-600">Interventions being tested to improve your life</p>
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
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {experiments?.length || 0} experiment{experiments?.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Experiments by Status */}
        <div className="space-y-8">
          {!experiments || experiments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🔬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments yet</h3>
              <p className="text-gray-500">
                {selectedStatus === "all"
                  ? "Experiments will appear here as they are created in the system."
                  : `No ${selectedStatus} experiments found.`}
              </p>
            </div>
          ) : (
            <>
              {groupedExperiments.running.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>🔬</span>
                      <span>Running Experiments</span>
                      <span className="text-sm font-normal text-gray-500">({groupedExperiments.running.length})</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {groupedExperiments.running.map((experiment) => (
                      <div key={experiment.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">{experiment.name}</h4>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Intervention:</span>
                            <p className="text-gray-900 mt-1">{experiment.intervention}</p>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">Success Criteria:</span>
                            <p className="text-gray-900 mt-1">{experiment.success_criteria}</p>
                          </div>

                          {experiment.metrics_to_track && experiment.metrics_to_track.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Tracking:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {experiment.metrics_to_track.map((metric) => (
                                  <span key={metric} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {metric}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {experiment.related_projects && experiment.related_projects.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Related Projects:</span>
                              <p className="text-gray-600 text-xs mt-1">{experiment.related_projects.join(", ")}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 mt-3">
                          Started: {new Date(experiment.started_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupedExperiments.completed.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>✅</span>
                      <span>Completed Experiments</span>
                      <span className="text-sm font-normal text-gray-500">({groupedExperiments.completed.length})</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {groupedExperiments.completed.map((experiment) => (
                      <div key={experiment.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <h4 className="font-semibold text-gray-900 mb-3">{experiment.name}</h4>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Intervention:</span>
                            <p className="text-gray-900 mt-1">{experiment.intervention}</p>
                          </div>

                          {experiment.outcome_summary && (
                            <div>
                              <span className="font-medium text-gray-700">Outcome:</span>
                              <p className="text-gray-900 mt-1">{experiment.outcome_summary}</p>
                            </div>
                          )}

                          {experiment.outcome_data && Object.keys(experiment.outcome_data).length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Data:</span>
                              <div className="text-xs text-gray-700 mt-1 space-y-1">
                                {Object.entries(experiment.outcome_data).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-600 mt-3">
                          {experiment.started_at && `Started: ${new Date(experiment.started_at).toLocaleDateString()}`}
                          {experiment.ended_at && ` • Ended: ${new Date(experiment.ended_at).toLocaleDateString()}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupedExperiments.abandoned.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>🗑️</span>
                      <span>Abandoned Experiments</span>
                      <span className="text-sm font-normal text-gray-500">({groupedExperiments.abandoned.length})</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {groupedExperiments.abandoned.map((experiment) => (
                      <div key={experiment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-2">{experiment.name}</h4>
                        <p className="text-sm text-gray-600">{experiment.intervention}</p>
                        {experiment.ended_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Abandoned: {new Date(experiment.ended_at).toLocaleDateString()}
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
