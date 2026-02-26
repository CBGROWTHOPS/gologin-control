const API = '/api';

async function handleRes<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error((j as { detail?: string }).detail || r.statusText);
  }
  if (r.status === 204) return {} as T;
  return r.json();
}

export type Profile = {
  id: string;
  name: string;
  os?: { id?: string };
  proxyType?: string;
  proxyRegion?: string;
  createdAt?: string;
  updatedAt?: string;
  isRunning?: boolean;
};

export type ProfileListResponse = {
  profiles: Profile[];
  allProfilesCount: number;
};

export async function getHealth(): Promise<{ status: string; version?: string } | null> {
  try {
    const r = await fetch(`${API}/health`);
    if (r.ok) return r.json();
  } catch {
    /* proxy unreachable */
  }
  return null;
}

export async function getStatus() {
  return handleRes<{ ok: boolean; token_set: boolean }>(await fetch(`${API}/status`));
}

export async function listProfiles(opts?: {
  page?: number;
  search?: string;
  sorterField?: string;
  sorterOrder?: string;
}) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.search) params.set('search', opts.search);
  if (opts?.sorterField) params.set('sorter_field', opts.sorterField);
  if (opts?.sorterOrder) params.set('sorter_order', opts.sorterOrder);
  const q = params.toString();
  return handleRes<ProfileListResponse>(await fetch(`${API}/profiles${q ? `?${q}` : ''}`));
}

export async function getProfile(id: string) {
  return handleRes<Profile>(await fetch(`${API}/profiles/${id}`));
}

export async function createProfile(body: { name: string; os: string; osSpec?: string }) {
  return handleRes<Profile>(await fetch(`${API}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function addProxy(body: {
  countryCode: string;
  profileIdToLink?: string;
  city?: string;
  isMobile?: boolean;
  isDC?: boolean;
}) {
  return handleRes<unknown>(await fetch(`${API}/proxies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function quickCreate(body: {
  name?: string;
  os?: string;
  countryCode?: string;
  city?: string;
  isMobile?: boolean;
}) {
  return handleRes<{ profile: Profile; proxy_linked: boolean }>(await fetch(`${API}/quick-create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function deleteProfiles(ids: string[]) {
  return handleRes<{ deleted: number }>(await fetch(`${API}/profiles`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profilesToDelete: ids }),
  }));
}

export async function renameProfile(profileId: string, name: string) {
  return handleRes<{ ok: boolean }>(await fetch(`${API}/profiles/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, name }),
  }));
}

export async function getTraffic() {
  return handleRes<Record<string, unknown>>(await fetch(`${API}/traffic`));
}
