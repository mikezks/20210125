
export function getGlobalNamespace<T>(): T {
  return  (
    (window as unknown) ||
    (self as unknown) ||
    (globalThis as unknown)
  ) as T;
}
