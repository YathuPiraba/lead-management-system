export function generateUsername(email: string): string {
  const prefix = email.split('@')[0];
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomSuffix}`;
}
