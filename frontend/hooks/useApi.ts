import useSWR from 'swr';
import { client } from '@/lib/api-client';
import type { components } from '@/lib/api-client';

type Observation = components["schemas"]["Observation"];
type Project = components["schemas"]["Project"];
type Experiment = components["schemas"]["Experiment"];
type Session = components["schemas"]["Session"];
type Metric = components["schemas"]["Metric"];
type Entity = components["schemas"]["Entity"];

export function useObservations(params?: { type?: string; status?: string }) {
  const key = params ? `/observations?${new URLSearchParams(params as any).toString()}` : '/observations';
  return useSWR(key, async () => {
    const { data, error } = await client.GET("/observations", {
      params: { query: params || {} }
    });
    if (error) throw new Error("Failed to load observations");
    return data as Observation[];
  });
}

export function useProjects(params?: { status?: string }) {
  const key = params ? `/projects?${new URLSearchParams(params as any).toString()}` : '/projects';
  return useSWR(key, async () => {
    const { data, error } = await client.GET("/projects", {
      params: { query: params || {} }
    });
    if (error) throw new Error("Failed to load projects");
    return data as Project[];
  });
}

export function useExperiments(params?: { status?: string }) {
  const key = params ? `/experiments?${new URLSearchParams(params as any).toString()}` : '/experiments';
  return useSWR(key, async () => {
    const { data, error } = await client.GET("/experiments", {
      params: { query: params || {} }
    });
    if (error) throw new Error("Failed to load experiments");
    return data as Experiment[];
  });
}

export function useSessions(params?: { limit?: number }) {
  const key = params ? `/sessions?${new URLSearchParams(params as any).toString()}` : '/sessions';
  return useSWR(key, async () => {
    const { data, error } = await client.GET("/sessions", {
      params: { query: params || {} }
    });
    if (error) throw new Error("Failed to load sessions");
    return data as Session[];
  });
}

export function useMetrics(params?: { metric_name?: string; start_date?: string; end_date?: string }) {
  const key = params ? `/metrics?${new URLSearchParams(params as any).toString()}` : '/metrics';
  return useSWR(key, async () => {
    const { data, error } = await client.GET("/metrics", {
      params: { query: params || {} }
    });
    if (error) throw new Error("Failed to load metrics");
    return data as Metric[];
  });
}

export function useEntities(params?: { type?: string; status?: string }) {
  const key = params ? `/entities?${new URLSearchParams(params as any).toString()}` : '/entities';
  return useSWR(key, async () => {
    const { data, error } = await client.GET("/entities", {
      params: { query: params || {} }
    });
    if (error) throw new Error("Failed to load entities");
    return data as Entity[];
  });
}
