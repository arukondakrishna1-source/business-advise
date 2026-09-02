const API_BASE_URL = 'http://localhost:5000';

export async function apiFetch(endpoint, options = {}) {
  // Try relative path first (Vite proxy)
  try {
    const res = await fetch(endpoint, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Relative fetch to ${endpoint} failed, falling back to ${API_BASE_URL}${endpoint}:`, err);
  }

  // Fallback to absolute backend URL
  const absoluteUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const res = await fetch(absoluteUrl, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }
  return await res.json();
}
