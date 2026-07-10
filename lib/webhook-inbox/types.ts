export interface WebhookInboxRef {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
}

export interface CapturedRequest {
  id: string;
  inbox_id: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string | null;
  content_type: string | null;
  ip: string | null;
  size_bytes: number;
  received_at: string;
}

export function inboxUrl(slug: string): string {
  if (typeof window === "undefined") return `/api/hooks/${slug}`;
  return `${window.location.origin}/api/hooks/${slug}`;
}
