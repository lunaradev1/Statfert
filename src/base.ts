/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-await-in-loop */
import type { BaseClient } from 'seyfert/lib/client/base'
import { request } from 'undici'
import { StatfertPostable } from './postable'
import { getCpuUsage, getRamInformation } from './utils'

type StatfertGraph = {
  id: string
  data: Record<string, any>
}

export class Statfert {
  public readonly commands: Map<string, number> = new Map<string, number>()
  protected body: Record<string, any> = {}
  private readonly graphs: StatfertGraph[] = []
  private isAutoPosting = false
  private isPosting = false
  private interval: NodeJS.Timeout | null = null

  constructor(
    public readonly client: BaseClient,
    public readonly apiKey: string
  ) {
    if (apiKey.length === 0) throw new Error('The API key cannot be empty!')
  }

  public get isRunning() {
    return this.isAutoPosting
  }

  /**
   * Starts posting to Statcord on an interval.
   * @param postables The postables to post to the API. This defaults to just the guild count of your bot.
   * @param timeBetweenRequests How long to wait between requests, in seconds. Minimum is 1 minute. Defaults to 60 seconds.
   * @throws If timeBetweenRequests is less than 60, this method will throw. If postables is an empty array, this will also throw. If this instance is already started, this will also throw.
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

    if (this.isAutoPosting)
      throw new Error(
        'You cannot use this method, this instance is already autoposting!'
      )

    this.isAutoPosting = true
    await this.sendStats(postables)

    this.interval = setInterval(async () => {
      void this.sendStats(postables)
    }, actualIntervalTime)

    return this.interval
  }

  public stop() {
    if (this.interval === null) return

    this.isAutoPosting = false
    clearInterval(this.interval)
    this.interval = null
  }

  public createCustomGraph(graph: StatfertGraph): this {
    this.graphs.push(graph)
    return this
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
    this.body = await this.getBaseBody(postables)

    await this.postStats(this.client.botId)
  }

  protected async getBaseBody(postables: StatfertPostable[]) {
    let body = {}
    const guilds = await this.getGuilds()

    for (const postable of postables) {
      switch (postable) {
        case StatfertPostable.CpuUsage: {
          body = {
            ...body,
            cpuUsage: getCpuUsage(),
          }
          break
        }

        case StatfertPostable.GuildCount: {
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

    if (this.graphs.length > 0)
      body = {
        ...body,
        customCharts: this.graphs.map((graph) => ({
          id: graph.id,
          data: graph.data,
        })),
      }

    if (this.commands.size > 0) {
      const commands = [...this.commands.entries()].map(([name, count]) => ({
        name,
        count,
      }))

      body = {
        ...body,
        topCommands: commands.sort((a, b) => b.count - a.count),
      }
    }

    return body
  }

  protected async postStats(botId: string) {
    if (this.isPosting) return

    this.isPosting = true

    try {
      const response = await request(this.basePostingUrl(botId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.apiKey,
        },
        body: JSON.stringify(this.body),
      })

      if (response.statusCode !== 200)
        throw new Error(
          `Request not successful. [${response.statusCode}] (${response.statusText})`
        )
    } finally {
      this.isPosting = false
    }
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
