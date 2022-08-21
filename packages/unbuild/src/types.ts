import { ConfigHooks } from 'hookable'
import { RollupOptions } from 'rollup'

interface UpRollupOptions extends RollupOptions {
  cjsBridge?: boolean;
  emitCJS?: boolean;
}

export type Entries = any;

export interface BuildConfig {
  preset?: string;
  rollup?: UpRollupOptions;
  entries?: Entries;
}

export interface Preset {
  declaration?: boolean;
  rollup?: UpRollupOptions;
  hooks: ConfigHooks<Record<string, any>>
}
