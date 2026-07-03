let domainSet: Set<string> | null = null;
const extraDomains = new Set([
  'doefy.com',
  'ozsaip.com',
  'asitrai.com',
]);

async function loadDomainList(): Promise<Set<string>> {
  if (!domainSet) {
    const domains: string[] = (await import('disposable-email-domains')).default;
    domainSet = new Set([...domains, ...extraDomains]);
  }
  return domainSet;
}

export async function isDisposableEmail(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  const list = await loadDomainList();
  return list.has(domain);
}
