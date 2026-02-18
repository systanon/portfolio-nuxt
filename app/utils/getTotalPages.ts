export const getTotalPages = (
  headers: Headers = new Headers()
): { total: number; pages: number } => {
  const total = Number(headers.get("x-total-count")) || 0;
  const pages = Number(headers.get("x-total-pages")) || 1;
  return { total, pages };
};
