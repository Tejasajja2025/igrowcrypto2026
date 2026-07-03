import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function safeJson<T = any>(response: Response): Promise<T | null> {
  if (!response) return null

  const contentType = response.headers.get('content-type') || ''

  // Try to create a clone for safe inspection before any body is consumed.
  let inspectText: string | null = null
  try {
    inspectText = await response.clone().text().catch(() => null)
  } catch (err) {
    inspectText = null
  }

  if (!response.ok) {
    console.warn('safeJson: response not ok', { status: response.status, statusText: response.statusText, contentType, body: inspectText?.slice?.(0, 200) })
    return null
  }

  // If content-type doesn't look like JSON, attempt to parse but log the snippet if it fails
  if (!contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch (error) {
      console.warn('safeJson: unexpected content-type or failed to parse JSON', { contentType, error, body: inspectText?.slice?.(0, 200) })
      return null
    }
  }

  try {
    return await response.json()
  } catch (error) {
    console.warn('safeJson: failed to parse JSON response', error, inspectText?.slice?.(0, 200))
    return null
  }
}
