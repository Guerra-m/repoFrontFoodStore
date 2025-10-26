// src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function post(endpoint: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error ${res.status}: ${txt || 'Unknown'}`);
  }
  return res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : await res.text();
}
