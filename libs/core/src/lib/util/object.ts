export function reverseObject<T extends Record<string, string>>(
  object: T
): Record<T[keyof T], keyof T> {
  return Object.entries(object).reduce(
    (acc, [key, value]) => Object.assign(acc, { [value]: key }),
    {} as Record<T[keyof T], keyof T>
  );
}
