import { Command, type CommandContext, Declare, Middlewares } from 'seyfert'

@Declare({
  name: 'ping',
  description: 'Statfert test command, lorem ipsum, all that shit.',
})
@Middlewares(['tracking'])
export default class PingCommand extends Command {
  public override async run(ctx: CommandContext) {
    await ctx.editOrReply({ content: 'Just a test command!' })
  }
}
