"use client";

import { useState } from "react";
import { useObservations } from "@/hooks/useApi";
import Header from "@/components/Header";

export default function ObservationsPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");

  const queryParams: { status?: string; type?: string } = {};
  if (selectedStatus !== "all") queryParams.status = selectedStatus;
  if (selectedType !== "all") queryParams.type = selectedType;

  const { data: observations, error, isLoading } = useObservations(queryParams);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading observations...</p>
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
            <p className="text-red-600 font-semibold">Failed to load observations</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Observations</h2>
          <p className="text-gray-600">Patterns, insights, and learnings about your life</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value="all">All Types</option>
                <option value="pattern">Pattern</option>
                <option value="correlation">Correlation</option>
                <option value="hypothesis">Hypothesis</option>
                <option value="insight">Insight</option>
                <option value="preference">Preference</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="validated">Validated</option>
                <option value="refuted">Refuted</option>
                <option value="outdated">Outdated</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                Showing {observations?.length || 0} observation{observations?.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Observations List */}
        <div className="space-y-4">
          {!observations || observations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No observations found with the selected filters.
            </div>
          ) : (
            observations?.map((obs) => (
              <div key={obs.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase">
                      {obs.type}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {Math.round(obs.confidence * 100)}% confidence
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      obs.status === "active" ? "bg-gray-100 text-gray-800" :
                      obs.status === "validated" ? "bg-green-100 text-green-800" :
                      obs.status === "refuted" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {obs.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(obs.created_at).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-900 text-base mb-4">{obs.content}</p>

                {obs.tags && obs.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {obs.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {obs.evidence && obs.evidence.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">Evidence</div>
                    <div className="text-xs text-gray-600">
                      {obs.evidence.map((ev, idx) => (
                        <div key={idx}>• {ev}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
