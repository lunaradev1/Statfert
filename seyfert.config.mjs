// Only required for tests, ignore this file.
import { env } from 'bun'
import { config } from 'seyfert'

const token = env['TOKEN']

if (!token)
  throw new Error(
    'Pass token into the tests by doing "TOKEN={your token} bun test"!'
  )

export default config.bot({
  token,
  intents: ['Guilds'],
  locations: {
    base: './tests',
    commands: 'commands',
  },
})
