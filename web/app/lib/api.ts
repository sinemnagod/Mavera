import { clearSession, readSession } from "./session";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const apiUrl = (path: string) => `${API_URL}${path}`;

// Calls the NestJS API. It adds the JWT, turns failures into readable errors,
// and sends the user back to sign-in when the token has expired.
export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const session = readSession();
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(session ? { authorization: `Bearer ${session.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  if (response.status === 401 && path !== "/auth/login") {
    clearSession();
    window.location.assign("/");
    throw new ApiError(401, "Please sign in again.");
  }

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = (data as { message?: unknown } | null)?.message;
    throw new ApiError(response.status, typeof message === "string" ? message : "Something went wrong.");
  }
  return data as T;
}
