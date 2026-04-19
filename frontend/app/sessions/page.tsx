"use client";

import { useState } from "react";
import { useSessions } from "@/hooks/useApi";
import Header from "@/components/Header";

export default function SessionsPage() {
  const [limit, setLimit] = useState(20);

  const { data: sessions, error, isLoading } = useSessions({ limit });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sessions...</p>
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
            <p className="text-red-600 font-semibold">Failed to load sessions</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sessions</h2>
          <p className="text-gray-600">History of tracked sessions</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value={10}>10 sessions</option>
                <option value={20}>20 sessions</option>
                <option value={50}>50 sessions</option>
                <option value={100}>100 sessions</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {sessions?.length || 0} session{sessions?.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {!sessions || sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-500">Session history will appear here as entries are added to the system.</p>
            </div>
          ) : (
            sessions?.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Session {session.id}
                      </h3>
                      {session.followup_needed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Followup Needed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Started: {new Date(session.started_at).toLocaleString()}
                      {session.ended_at && ` • Ended: ${new Date(session.ended_at).toLocaleString()}`}
                    </div>
                  </div>
                </div>

                {session.summary && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Summary</div>
                    <p className="text-sm text-gray-900">{session.summary}</p>
                  </div>
                )}

                {session.session_observations && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Session Observations</div>
                    <p className="text-sm text-gray-700 italic">{session.session_observations}</p>
                  </div>
                )}

                {session.action_items && session.action_items.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">Action Items</div>
                    <ul className="space-y-1">
                      {session.action_items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-900 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {session.followup_items && session.followup_items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="text-xs font-medium text-yellow-700 mb-2">Followup Items</div>
                    <ul className="space-y-1">
                      {session.followup_items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-900 flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">⚡</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
