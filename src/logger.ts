import * as winston from 'winston';
import 'winston-daily-rotate-file';

const fileFormat = winston.format.combine(
  winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
  })
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    fileFormat
  ),
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'payments-app' },
  transports: [
    consoleTransport,
  ]
});
