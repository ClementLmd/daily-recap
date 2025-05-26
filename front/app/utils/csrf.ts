export async function getCsrfToken(): Promise<string> {
  const response = await fetch("/api/csrf", {
    credentials: "include",
  });
  const data = await response.json();
  return data.csrfToken;
}

export function getCsrfHeaders(): HeadersInit {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1];

  return {
    "X-CSRF-Token": csrfToken || "",
  };
}
