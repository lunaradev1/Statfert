/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { env } from 'bun'
import { beforeAll, describe, expect, it } from 'bun:test'
import { Client } from 'seyfert'
import { ShardedStatfert, StatfertPostable } from '../src'

describe('Sharded Statfert Test Suite', () => {
  let client: ShardedStatfert

  beforeAll(async () => {
    const apiKey = env['API_KEY']

    if (!apiKey) throw new Error('No API_KEY enviroment variable was provided.')

    const seyfert = new Client()
    client = new ShardedStatfert(seyfert, apiKey)

    await seyfert.start()
  })

  it('has valid client', () => {
    expect(client).toBeInstanceOf(ShardedStatfert)
  })

  it('does not throw when shards is involved', () => {
    expect(async () =>
      client.start([StatfertPostable.ShardCount])
    ).not.toThrow()
  })

  it('throws when postables is an empty array', () => {
    expect(async () => client.start([])).toThrow()
  })

  it('throws when interval is an invalid value', () => {
    expect(async () =>
      client.start([StatfertPostable.GuildCount], 10)
    ).toThrow()
  })

  it('does not throw when used correctly', () => {
    expect(async () => client.start()).not.toThrow()
  })

  it('does not throw when using all available postables', () => {
    expect(async () =>
      client.start([
        StatfertPostable.CpuUsage,
        StatfertPostable.GuildCount,
        StatfertPostable.MemInformation,
        StatfertPostable.Members,
        StatfertPostable.ShardCount,
        StatfertPostable.UserCount,
      ])
    ).not.toThrow()
  })
})
