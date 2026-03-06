import { delay } from '~/utils/delay'

export async function ensureMinDelay<T>(
  promise: Promise<T>,
  minDuration: number,
): Promise<T> {
  const start = performance.now()
  const result = await promise
  const elapsed = performance.now() - start
  if (elapsed < minDuration) {
    await delay(minDuration - elapsed)
  }
  return result
}
