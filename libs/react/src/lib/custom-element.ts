import {
  MutableRefObject,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type CustomElementAttributeValue = string | number | boolean | null | undefined;

export function useForwardedElementRef<T>(forwardedRef: Ref<T> | undefined) {
  const [element, setElement] = useState<T | null>(null);

  const ref = useCallback(
    (nextElement: T | null) => {
      setElement(nextElement);

      if (!forwardedRef) {
        return;
      }

      if (typeof forwardedRef === 'function') {
        forwardedRef(nextElement);
        return;
      }

      (forwardedRef as MutableRefObject<T | null>).current = nextElement;
    },
    [forwardedRef]
  );

  return [element, ref] as const;
}

export function getDefinedCustomElementProps<
  T extends Record<string, CustomElementAttributeValue>,
>(props: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value != null)
  ) as Partial<T>;
}

export function toCustomElementAttributeValue(
  value: CustomElementAttributeValue
): string | undefined {
  return value == null ? undefined : `${value}`;
}

export function useCustomElementEvent<
  TElement extends EventTarget,
  TDetail = undefined,
>(
  element: TElement | null,
  eventName: string,
  handler: ((detail: TDetail) => void) | undefined
): void {
  const handlerRef = useRef(handler);

  handlerRef.current = handler;

  useEffect(() => {
    if (!element) {
      return;
    }

    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<TDetail>;
      handlerRef.current?.(customEvent.detail);
    };

    element.addEventListener(eventName, listener);

    return () => {
      element.removeEventListener(eventName, listener);
    };
  }, [element, eventName]);
}
