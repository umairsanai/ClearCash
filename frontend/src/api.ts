import type {
  CreatePocketResult,
  Notification,
  Pocket,
  PocketMutationResult,
  Recipient,
  Spending,
  User,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL as string;

interface ApiResponse<T> {
  data: T;
  message?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = response.status === 204 ? undefined : await response.json() as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(payload?.message ?? "Something went wrong. Please try again.");
  }

  return payload?.data as T;
}

export const api = {
  getMe: () => request<User>("/users/me"),
  login: (username: string, password: string) => request<{ name: string; email: string; username: string }>("/auth/login", {
    method: "POST", body: JSON.stringify({ username, password }),
  }),
  signup: (values: { name: string; email: string; username: string; phone: string; password: string }) => request<User>("/auth/signup", {
    method: "POST", body: JSON.stringify(values),
  }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  createPocket: (values: { pocket_name: string; pocket_limit: number; color: string }) => request<CreatePocketResult>("/pockets/create", {
    method: "PUT", body: JSON.stringify(values),
  }),
  updatePocket: (values: { old_pocket_name: string; new_pocket_name: string; new_pocket_limit: number; new_pocket_color: string }) => request<User>("/pockets/update", {
    method: "PATCH", body: JSON.stringify(values),
  }),
  deletePocket: (id: number) => request<User>(`/pockets/delete/${id}`, { method: "DELETE" }),
  transferToPocket: (values: { sender_pocket: number; receiver_pocket: number; amount: number }) => request<PocketMutationResult>("/users/transfer-to-pocket", {
    method: "POST", body: JSON.stringify(values),
  }),
  findRecipients: (search: string) => request<Recipient[]>(`/users/find?search=${encodeURIComponent(search)}`),
  sendMoney: (values: { sender_pocket_id: number; recipient_user_id: number; amount: number }) => request<User>("/users/send", {
    method: "POST", body: JSON.stringify(values),
  }),
  weeklySpendings: (startDate: string, endDate: string) => request<Spending[]>(`/users/weekly-spendings?start_date=${startDate}&end_date=${endDate}`),
  markAllNotificationsRead: () => request<Notification[]>("/notifications/mark-all-read", { method: "POST" }),
  deleteNotification: (id: number) => request<Notification[]>(`/notifications/${id}`, { method: "DELETE" }),
};

export function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export function pocketTheme(color?: string): string {
  return (color ?? "RED").toLowerCase();
}

export function isUnread(notification: Notification): boolean {
  return notification.is_read === false || notification.is_read === 0;
}
