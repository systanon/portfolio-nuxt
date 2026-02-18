export function errorMsg(error: unknown): string {
  return (
    (error as { data?: { message?: string } })?.data?.message ||
    (error as { data?: { error?: string } })?.data?.error ||
    (error as { message?: string })?.message ||
    (error as { error?: string })?.error ||
    'Unknown error'
  )
}
