export function getCsrfHeaders(): HeadersInit {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1];

  return {
    "X-CSRF-Token": csrfToken || "",
  };
}
