import type { Client } from 'seyfert'
import { Statfert, StatfertPostable } from './index'

export class ShardedStatfert extends Statfert {
  public constructor(
    public override readonly client: Client,
    public override readonly apiKey: string
  ) {
    super(client, apiKey)
  }

  public override async sendStats(postables = [StatfertPostable.GuildCount]) {
    this.body = {
      ...(await this.getBaseBody(postables)),
    }

    if (postables.includes(StatfertPostable.ShardCount))
      this.body = {
        ...this.body,
        shardCount: this.client.gateway.totalShards,
      }

    await this.postStats(this.client.botId)
  }
}
