/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { env } from 'bun'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { Client, type ParseClient, type ParseMiddlewares } from 'seyfert'
import { Statfert, StatfertPostable } from '../src'
import middlewares from './middlewares'

describe('Base Statfert Test Suite', () => {
  let client: Statfert
  const seyfert: Client = new Client()

  beforeAll(async () => {
    seyfert.setServices({
      middlewares,
    })
    await seyfert.start()
  })

  beforeEach(async () => {
    const apiKey = env['API_KEY']

    if (!apiKey) throw new Error('No API_KEY enviroment variable was provided.')

    client = new Statfert(seyfert, apiKey)
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
    expect(async () => {
      await client.start()
      client.stop()
    }).not.toThrow()
  })

  it('does not throw when using all available postables', () => {
    expect(async () => {
      await client.start([
        StatfertPostable.CpuUsage,
        StatfertPostable.GuildCount,
        StatfertPostable.MemInformation,
        StatfertPostable.Members,
        StatfertPostable.UserCount,
      ])
      client.stop()
    }).not.toThrow()
  })
})

declare module 'seyfert' {
  interface UsingClient extends ParseClient<Client> {
    // @ts-expect-error This is fine.
    statfert: Statfert
  }

  interface RegisteredMiddlewares extends ParseMiddlewares<
    typeof middlewares
  > {}
}
