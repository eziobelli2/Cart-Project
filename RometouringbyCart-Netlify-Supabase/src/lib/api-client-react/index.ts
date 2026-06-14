import { useMutation, useQuery } from "@tanstack/react-query";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const getListToursQueryKey = () => ["tours"];
export function useListTours(options?: any) {
  return useQuery({ queryKey: getListToursQueryKey(), queryFn: () => apiFetch<any[]>("/tours"), ...(options || {}) });
}

export const getGetBookingsSummaryQueryKey = () => ["bookings", "summary"];
export function useGetBookingsSummary(options?: any) {
  return useQuery({ queryKey: getGetBookingsSummaryQueryKey(), queryFn: () => apiFetch<any>("/bookings/summary"), ...(options || {}) });
}

export const getListAdminBookingsQueryKey = (params?: Record<string, any>) => ["admin", "bookings", params || {}];
export function useListAdminBookings(params?: Record<string, any>, options?: any) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return useQuery({
    queryKey: getListAdminBookingsQueryKey(params),
    queryFn: () => apiFetch<any[]>(`/admin/bookings${qs ? `?${qs}` : ""}`),
    ...(options || {}),
  });
}

export function useCreateBooking() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch<any>("/bookings", { method: "POST", body: JSON.stringify(data) }) });
}

export function useCreateAdminBooking() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch<any>("/admin/bookings", { method: "POST", body: JSON.stringify(data) }) });
}

export function useUpdateAdminBooking() {
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch<any>(`/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) }) });
}

export const getGetAvailabilityCalendarQueryKey = (params?: { month?: string }) => ["admin", "availability", params || {}];
export function useGetAvailabilityCalendar(params: { month: string }, options?: any) {
  return useQuery({
    queryKey: getGetAvailabilityCalendarQueryKey(params),
    queryFn: () => apiFetch<any[]>(`/admin/availability?month=${encodeURIComponent(params.month)}`),
    ...(options || {}),
  });
}

export function useCreateAvailabilitySlot() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch<any>("/admin/slots", { method: "POST", body: JSON.stringify(data) }) });
}

export function useDeleteAvailabilitySlot() {
  return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch<void>(`/admin/slots/${id}`, { method: "DELETE" }) });
}

export function useSubscribeNewsletter() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch<any>("/newsletter", { method: "POST", body: JSON.stringify(data) }) });
}
