export type BooleanType = boolean | string | null | undefined;
export type NumberType = number | string | null | undefined;

export function coerceBooleanProperty(value: unknown): boolean {
  return value != null && `${value}` !== 'false';
}

export function coerceNumberProperty(value: unknown): number;
export function coerceNumberProperty<D>(
  value: unknown,
  fallback: D
): number | D;
export function coerceNumberProperty(value: unknown, fallbackValue = 0) {
  return _isNumberValue(value) ? Number(value) : fallbackValue;
}

export function _isNumberValue(value: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !isNaN(parseFloat(value as any)) && !isNaN(Number(value));
}
