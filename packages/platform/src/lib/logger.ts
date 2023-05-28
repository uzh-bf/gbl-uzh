import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: '@gbl-uzh/platform' },
  transports: [new winston.transports.Console()],
})

export default logger
