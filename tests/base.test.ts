/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { env } from 'bun'
import { beforeAll, describe, expect, it } from 'bun:test'
import { Client } from 'seyfert'
import { Statfert, StatfertPostable } from '../src'

describe('Base Statfert Test Suite', () => {
  let client: Statfert

  beforeAll(async () => {
    const apiKey = env['API_KEY']

    if (!apiKey) throw new Error('No API_KEY enviroment variable was provided.')

    const seyfert = new Client()
    client = new Statfert(seyfert, apiKey)

    await seyfert.start()
  })

  it('has valid client', () => {
    expect(client).toBeInstanceOf(Statfert)
  })

  it('does throw when shards is involved', () => {
    expect(async () => client.start([StatfertPostable.ShardCount])).toThrow()
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
        StatfertPostable.UserCount,
      ])
    ).not.toThrow()
  })
})
