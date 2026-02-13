/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { type ParseClient } from 'seyfert'
import { type BaseClient } from 'seyfert/lib/client/base'
import type { Statfert } from './base'
import type { ShardedStatfert } from './sharded'

export * from './base'
export * from './middleware'
export * from './sharded'
export * from './postable'

declare module 'seyfert' {
  interface UsingClient extends ParseClient<BaseClient> {
    statfert: Statfert | ShardedStatfert
  }
}
