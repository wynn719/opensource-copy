export type HookCallback = (...args: unknown[]) => void | Promise<void>;
export type Hooks = Record<string, HookCallback[]>;
export type HookKeys<T> = keyof T & string;
export type ConfigHooks<T> = T | any;
