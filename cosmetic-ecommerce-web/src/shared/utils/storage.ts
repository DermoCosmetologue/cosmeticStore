export function readJsonStorage<TValue>(
  key: string,
  fallback: TValue,
  validate?: (value: unknown) => value is TValue,
) {
  try {
    const rawValue = localStorage.getItem(key)
    if (!rawValue) return fallback

    const parsedValue: unknown = JSON.parse(rawValue)
    return validate && !validate(parsedValue) ? fallback : (parsedValue as TValue)
  } catch {
    removeStorageItem(key)
    return fallback
  }
}

export function writeJsonStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage quota/privacy errors; the in-memory state remains usable.
  }
}

export function removeStorageItem(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage access errors.
  }
}
