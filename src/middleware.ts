import { createMiddleware } from 'seyfert'

export const statfertTrackingMiddleware = createMiddleware<void>(
  ({ context, next }) => {
    if (!('name' in context.command) || !('statfert' in context.client)) {
      next()
      return
    }

    const { name } = context.command
    const { statfert } = context.client

    const currentValue = statfert.commands.get(name)

    if (currentValue) statfert.commands.set(name, currentValue + 1)
    else statfert.commands.set(name, 1)

    next()
  }
)
