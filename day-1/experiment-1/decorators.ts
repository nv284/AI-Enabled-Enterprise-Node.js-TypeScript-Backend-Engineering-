export function Log<T extends (...args: any[]) => any>(
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
  // Ensure descriptor/value exists and is a function (method decorator)
  if (!descriptor || typeof descriptor.value !== 'function') {
    throw new Error('@Log can only be applied to methods (not properties).');
  }

  const original = descriptor.value;

  // Wrapped function preserves `this` and original signature as much as possible
  const wrapped: T = function (this: any, ...args: Parameters<T>) {
    const name = propertyKey.toString();
    console.debug(`[LOG] ${name} start`, args);

    try {
      const result = original.apply(this, args) as ReturnType<T> | Promise<ReturnType<T>>;

      if (result && typeof (result as any).then === 'function') {
        // async result - attach logging to promise lifecycle
        return (result as Promise<any>)
          .then((res) => {
            console.debug(`[LOG] ${name} success`);
            return res;
          })
          .catch((err) => {
            console.debug(`[LOG] ${name} error`, err);
            throw err;
          }) as unknown as ReturnType<T>;
      }

      // sync result
      console.debug(`[LOG] ${name} success`);
      return result as ReturnType<T>;
    } catch (err) {
      console.debug(`[LOG] ${name} error`, err);
      throw err;
    }
  } as unknown as T;

  descriptor.value = wrapped;
  return descriptor;
}