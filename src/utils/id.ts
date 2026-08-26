export function generateId(): string {
  return crypto.randomUUID();
}

export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}