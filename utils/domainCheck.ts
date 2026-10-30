const ALLOWED_DOMAIN = 'hbplus.fit';

export function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  return parts[1].toLowerCase() === ALLOWED_DOMAIN;
}

export function getDomainError(): string {
  return 'Access restricted. Please login using your official domain email.';
}
