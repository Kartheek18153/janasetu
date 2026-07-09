const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

export function sanitizeHtml(input: string): string {
  return String(input).replace(/[&<>"'/]/g, (char) => ENTITY_MAP[char] || char);
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeHtml(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

const URL_PROTOCOL_RE = /^(https?:\/\/|mailto:|tel:)/i;

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (!URL_PROTOCOL_RE.test(trimmed)) return '';
  return sanitizeHtml(trimmed);
}
