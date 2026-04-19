/**
 * API client for Life Context System.
 * Types are generated from the FastAPI OpenAPI spec.
 */

import createClient from "openapi-fetch";
import type { paths } from "./api-types";

export const client = createClient<paths>({
  baseUrl: process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:8000",
});

// Re-export types for convenience
export type { components } from "./api-types";
