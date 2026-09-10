import { extractErrorMessage } from "../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type AuditLog = {
  audit_log_id: number;
  actor_id: string;
  action: string;
  resource: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type AuditPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AuditResponse = {
  data: AuditLog[];
  pagination: AuditPagination;
};

export type AuditQuery = {
  page?: number;
  limit?: number;
  action?: string;
};

export async function getAuditLogs(
  token: string,
  query: AuditQuery = {},
): Promise<AuditResponse> {
  const params = new URLSearchParams();

  if (query.page) {
    params.set("page", String(query.page));
  }

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.action?.trim()) {
    params.set("action", query.action.trim());
  }

  const queryString = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/audit${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Failed to load audit logs."),
    );
  }

  return response.json();
}
