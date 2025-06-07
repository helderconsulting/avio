// This interface is patched so that
// the return type can get inferred
// instead of returning 'any'
interface Body {
  json<T>(): Promise<T>;
}
