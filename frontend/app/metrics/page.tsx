"use client";

import { useState } from "react";
import { useMetrics } from "@/hooks/useApi";
import type { components } from "@/lib/api-client";
import Header from "@/components/Header";

type Metric = components["schemas"]["Metric"];

export default function MetricsPage() {
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const queryParams: { metric_name?: string; start_date?: string; end_date?: string } = {};
  if (selectedMetric !== "all") queryParams.metric_name = selectedMetric;
  if (startDate) queryParams.start_date = startDate;
  if (endDate) queryParams.end_date = endDate;

  const { data: metrics, error, isLoading } = useMetrics(queryParams);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading metrics...</p>
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
            <p className="text-red-600 font-semibold">Failed to load metrics</p>
          </div>
        </main>
      </>
    );
  }

  // Get unique metric names for filter
  const uniqueMetricNames = Array.from(new Set(metrics?.map(m => m.metric_name) || [])).sort();

  // Group metrics by name
  const groupedMetrics = (metrics || []).reduce((acc, metric) => {
    if (!acc[metric.metric_name]) {
      acc[metric.metric_name] = [];
    }
    acc[metric.metric_name]?.push(metric);
    return acc;
  }, {} as Record<string, Metric[]>);

  // Sort each group by date descending
  Object.values(groupedMetrics).forEach(group => {
    group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Metrics</h2>
          <p className="text-gray-600">Time-series data tracking various aspects of your life</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
              >
                <option value="all">All Metrics</option>
                {uniqueMetricNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                Showing {metrics?.length || 0} data point{metrics?.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Display */}
        <div className="space-y-8">
          {!metrics || metrics.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h3>
              <p className="text-gray-500">
                {selectedMetric === "all"
                  ? "Metrics data will appear here as it's imported from journals or added manually."
                  : `No data found for ${selectedMetric} in the selected date range.`}
              </p>
            </div>
          ) : (
            Object.entries(groupedMetrics).map(([metricName, metricData]) => (
              <div key={metricName} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span>📈</span>
                    <span>{metricName}</span>
                    <span className="text-sm font-normal text-gray-500">({metricData.length} points)</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {metricData.map((metric, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(metric.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {metric.value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              {metric.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {metric.metadata && Object.keys(metric.metadata).length > 0 ? (
                              <div className="space-y-1">
                                {Object.entries(metric.metadata).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
