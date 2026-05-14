import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  title: string | null;
  clicks: number;
  isPasswordProtected: boolean;
  expiresAt: string | null;
  createdAt: string;
  lastVisitedAt: string | null;
  qrCode: string | null;
  isExpired: boolean;
}

export interface ResolvedUrl {
  originalUrl: string;
  isPasswordProtected: boolean;
  isExpired: boolean;
  shortCode: string;
}

export interface UrlAnalytics {
  urlId: string;
  totalClicks: number;
  clicksByDay: Array<{ date: string; clicks: number }>;
  lastVisitedAt: string | null;
  createdAt: string;
}

export interface DashboardAnalytics {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
  topUrls: ShortUrl[];
  clicksByDay: Array<{ date: string; clicks: number }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateUrlInput {
  originalUrl: string;
  title?: string;
  customAlias?: string;
  password?: string;
  expiresAt?: string;
}

export interface ListUrlsParams {
  search?: string;
  sortBy?: "createdAt" | "clicks" | "title";
  sortOrder?: "asc" | "desc";
  filter?: "all" | "active" | "expired" | "password_protected";
}

// ---------------------------------------------------------------------------
// Auth token helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem("nexus_token");
}

export function setToken(token: string): void {
  localStorage.setItem("nexus_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("nexus_token");
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let errorData: { error?: string } = {};
    try {
      errorData = await res.json();
    } catch {
      // ignore parse errors
    }
    const err = new Error(errorData.error ?? `HTTP ${res.status}`) as Error & {
      status: number;
      data: typeof errorData;
    };
    err.status = res.status;
    err.data = errorData;
    throw err;
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const queryKeys = {
  me: () => ["auth", "me"] as const,
  urls: (params?: ListUrlsParams) => ["urls", params] as const,
  url: (id: string) => ["url", id] as const,
  urlAnalytics: (id: string) => ["url-analytics", id] as const,
  dashboardAnalytics: () => ["dashboard-analytics"] as const,
  resolveUrl: (code: string) => ["resolve", code] as const,
};

// Expose these so components can invalidate them
export const getListUrlsQueryKey = () => queryKeys.urls();
export const getGetDashboardAnalyticsQueryKey = () => queryKeys.dashboardAnalytics();

// ---------------------------------------------------------------------------
// Auth hooks
// ---------------------------------------------------------------------------

export function useGetMe() {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => apiFetch<User>("/auth/me"),
    retry: false,
    enabled: !!getToken(),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      apiFetch<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (res) => {
      setToken(res.token);
      queryClient.setQueryData(queryKeys.me(), res.user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (res) => {
      setToken(res.token);
      queryClient.setQueryData(queryKeys.me(), res.user);
    },
  });
}

// ---------------------------------------------------------------------------
// URL hooks
// ---------------------------------------------------------------------------

export function useListUrls(params?: ListUrlsParams) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params?.filter) searchParams.set("filter", params.filter);
  const qs = searchParams.toString();

  return useQuery({
    queryKey: queryKeys.urls(params),
    queryFn: () => apiFetch<ShortUrl[]>(`/urls${qs ? `?${qs}` : ""}`),
    enabled: !!getToken(),
  });
}

export function useGetUrl(id: string) {
  return useQuery({
    queryKey: queryKeys.url(id),
    queryFn: () => apiFetch<ShortUrl>(`/urls/${id}`),
    enabled: !!id && !!getToken(),
  });
}

export function useCreateUrl() {
  return useMutation({
    mutationFn: ({ data }: { data: CreateUrlInput }) =>
      apiFetch<ShortUrl>("/urls", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateUrl() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; expiresAt?: string };
    }) =>
      apiFetch<ShortUrl>(`/urls/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  });
}

export function useDeleteUrl() {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch<{ message: string }>(`/urls/${id}`, { method: "DELETE" }),
  });
}

// ---------------------------------------------------------------------------
// Redirect / public hooks
// ---------------------------------------------------------------------------

export function useResolveUrl(code: string) {
  return useQuery({
    queryKey: queryKeys.resolveUrl(code),
    queryFn: () => apiFetch<ResolvedUrl>(`/r/${code}`),
    enabled: !!code,
    retry: false,
  });
}

export function useVerifyUrlPassword() {
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: { password: string } }) =>
      apiFetch<ResolvedUrl>(`/r/${code}/verify-password`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

// ---------------------------------------------------------------------------
// Analytics hooks
// ---------------------------------------------------------------------------

export function useGetUrlAnalytics(id: string) {
  return useQuery({
    queryKey: queryKeys.urlAnalytics(id),
    queryFn: () => apiFetch<UrlAnalytics>(`/urls/${id}/analytics`),
    enabled: !!id && !!getToken(),
  });
}

export function useGetDashboardAnalytics() {
  return useQuery({
    queryKey: queryKeys.dashboardAnalytics(),
    queryFn: () => apiFetch<DashboardAnalytics>("/analytics/dashboard"),
    enabled: !!getToken(),
  });
}
