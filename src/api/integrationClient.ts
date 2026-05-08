// Public Integration API client — calls /v1/sessions/{id} and friends directly
// from the browser using an Application API key in the X-API-Key header.

export class IntegrationApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'IntegrationApiError';
    this.status = status;
    this.body = body;
  }
}

// Default base URL for the BlueMonk Integration API. Can be set via the
// VITE_INTEGRATION_API_BASE_URL env var, and overridden per-session in the
// setup screen so the same build can target multiple BlueMonk instances
// (e.g. local dev, staging, a prospect's sandbox).
export function getDefaultIntegrationApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_INTEGRATION_API_BASE_URL;
  if (fromEnv) return fromEnv;
  return `${window.location.protocol}//${window.location.host}`;
}

export interface IntegrationFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

export async function integrationApiFetch<T>(
  baseUrl: string,
  endpoint: string,
  apiKey: string,
  options?: IntegrationFetchOptions
): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let body: unknown;
    let message = response.statusText;
    try {
      body = await response.json();
      const parsed = body as { error?: string; message?: string };
      message = parsed.error || parsed.message || message;
    } catch {
      // non-JSON error response — fall back to statusText
    }
    throw new IntegrationApiError(message, response.status, body);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
}

export const integrationApiEndpoints = {
  sessions: {
    upsert: (integrationId: string, dry?: boolean) => {
      const params = dry ? '?dry=true' : '';
      return `/v1/sessions/${encodeURIComponent(integrationId)}${params}`;
    },
  },
  events: {
    track: (dry?: boolean) => `/v1/events${dry ? '?dry=true' : ''}`,
  },
  customers: {
    inventory: (integrationId: string) =>
      `/v1/customers/${encodeURIComponent(integrationId)}/inventory?coupons=true&profile=true`,
  },
} as const;
