const BASE = import.meta.env.VITE_API_URL;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id) {
        headers["X-User-Id"] = String(user.id);
      }
    } catch (e) {
      console.error("Error parsing user", e);
    }
  }

  return headers;
}

export async function GET<T = any>(path: string): Promise<T> {
  console.log("GET:", BASE + path);
  const res = await fetch(BASE + path, {
    method: "GET",
    headers: getHeaders(),
  });

  console.log("Response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response:", errorText);
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function POST<T = any>(path: string, body?: any): Promise<T> {
  console.log("POST:", BASE + path, body);
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response:", errorText);
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function PUT<T = any>(path: string, body?: any): Promise<T> {
  console.log("PUT:", BASE + path, body);
  const res = await fetch(BASE + path, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response:", errorText);
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function DELETE(path: string): Promise<void> {
  console.log("DELETE:", BASE + path);
  const res = await fetch(BASE + path, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response:", errorText);
    throw new Error(errorText || `HTTP ${res.status}`);
  }
}

export const DEL = DELETE;
