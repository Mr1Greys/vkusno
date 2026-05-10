const IIKO_BASE = 'https://api-ru.iiko.services/api/1';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

export async function getIikoToken(): Promise<string> {
  const apiLogin = process.env.IIKO_API_LOGIN;
  if (!apiLogin) {
    throw new Error('IIKO_API_LOGIN not configured');
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(`${IIKO_BASE}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiLogin }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get iiko token: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  return data.token;
}

export async function iikoRequest<T>(
  endpoint: string,
  body: object
): Promise<T> {
  const token = await getIikoToken();

  const res = await fetch(`${IIKO_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`iiko API error ${res.status}: ${err}`);
  }

  return res.json();
}

export interface IikoOrganization {
  id: string;
  name: string;
}

export async function getOrganizations(): Promise<IikoOrganization[]> {
  const result = await iikoRequest<{ organizations: IikoOrganization[] }>(
    '/organizations',
    {}
  );
  return result.organizations;
}

export interface IikoTerminalGroup {
  id: string;
  name: string;
  organizationId: string;
}

export async function getTerminalGroups(
  organizationId: string
): Promise<IikoTerminalGroup[]> {
  const result = await iikoRequest<{ terminalGroups: IikoTerminalGroup[] }>(
    '/terminal_groups',
    { organizationId }
  );
  return result.terminalGroups;
}

export interface IikoPaymentType {
  id: string;
  name: string;
  kind: 'Cash' | 'Card' | 'External';
  isActive: boolean;
}

export async function getPaymentTypes(
  organizationId: string
): Promise<IikoPaymentType[]> {
  const result = await iikoRequest<{ paymentTypes: IikoPaymentType[] }>(
    '/payment_types',
    { organizationId }
  );
  return result.paymentTypes;
}

export async function checkIikoConnection(): Promise<{
  ok: boolean;
  orgName?: string;
  error?: string;
}> {
  try {
    const organizations = await getOrganizations();
    if (organizations.length === 0) {
      return { ok: false, error: 'No organizations found' };
    }
    return { ok: true, orgName: organizations[0].name };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}