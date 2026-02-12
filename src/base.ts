/* eslint-disable no-await-in-loop */
import type { BaseClient } from 'seyfert/lib/client/base'
import { request } from 'undici'
import { StatfertPostable } from './postable'
import { getCpuUsage, getRamInformation } from './utils'

export class Statfert {
  constructor(
    public readonly client: BaseClient,
    public readonly apiKey: string
  ) {
    if (apiKey.length === 0) throw new Error('The API key cannot be empty!')
  }

  /**
   * Starts posting to Statcord on an interval.
   * @param postables The postables to post to the API. This defaults to just the guild count of your bot.
   * @param timeBetweenRequests How long to wait between requests, in seconds. Minimum is 1 minute. Defaults to 60 seconds.
   * @throws If timeBetweenRequests is less than 60, this method will throw. If postables is an empty array, this will also throw.
   * @returns The interval in case you want to clear it later
   */
  public async start(
    postables = [StatfertPostable.GuildCount],
    timeBetweenRequests = 60
  ) {
    if (postables.length === 0)
      throw new Error('The postables array cannot be empty!')
    if (timeBetweenRequests < 60)
      throw new Error(
        'The time between requests cannot be less than 1 minute (60 seconds)!'
      )

    const actualIntervalTime = timeBetweenRequests * 1000 // Converted to milliseconds

    await this.sendStats(postables)

    return setInterval(
      async () => this.sendStats(postables),
      actualIntervalTime
    )
  }

  /**
   * Posts stats to Statcord manually
   * @param postables The postables to post to the API. This defaults to just the guild count of your bot.
   * @throws If postables is an empty array, this will throw. If postables includes ShardCount, this will throw.
   */
  public async sendStats(postables = [StatfertPostable.GuildCount]) {
    if (postables.includes(StatfertPostable.ShardCount))
      throw new Error(
        'The default Statfert does not include shard count capabilities, instantiate ShardedStatfert instead!'
      )
    const body = await this.getBaseBody(postables)

    await this.postStats(this.client.botId, body)
  }

  protected async getBaseBody(postables: StatfertPostable[]) {
    let body = {}

    for (const postable of postables) {
      if (postables.length === 0)
        throw new Error('The postables array cannot be empty!')

      switch (postable) {
        case StatfertPostable.CpuUsage: {
          body = {
            ...body,
            cpuUsage: getCpuUsage(),
          }
          break
        }

        case StatfertPostable.GuildCount: {
          const guilds = await this.getGuilds()
          body = {
            ...body,
            guildCount: guilds.length,
          }
          break
        }

        case StatfertPostable.ShardCount: {
          // Handled by ShardedStatfert, but this is just to please XO.
          break
        }

        case StatfertPostable.MemInformation: {
          body = {
            ...body,
            ...getRamInformation(),
          }
          break
        }

        case StatfertPostable.Members: {
          const guilds = await this.getGuilds()
          let memberCount = 0

          for (const anonymousGuild of guilds) {
            const guild = await anonymousGuild.fetch()

            if (!guild.memberCount) continue

            memberCount += guild.memberCount
          }

          body = {
            ...body,
            members: memberCount,
          }
          break
        }

        case StatfertPostable.UserCount: {
          const userCount = this.client.cache.users?.count()

          if (!userCount) break

          body = {
            ...body,
            userCount,
          }

          break
        }
      }
    }

    return body
  }

  protected async postStats(botId: string, body: Record<string, any>) {
    const response = await request(this.basePostingUrl(botId), {
      method: 'POST',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: this.apiKey,
      },
      body: JSON.stringify(body),
    })

    if (response.statusCode !== 200)
      throw new Error(
        `Request not successful. [${response.statusCode}] (${response.statusText})`
      )
  }

  private async getGuilds() {
    return this.client.guilds.list()
  }

  private basePostingUrl(botId: string) {
    return `${this.baseApiUrl}/${botId}/stats`
  }

  private get baseApiUrl() {
    return 'https://statcord.com/api/bots'
  }
}
