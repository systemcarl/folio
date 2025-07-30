import pino from 'pino';
import { NODE_ENV } from '$env/static/private';

const logger = (NODE_ENV === 'development')
  ? pino({ transport : { target : 'pino-pretty' } })
  : pino();

export function log(
  entry : unknown,
  options : {
    level? : 'info' | 'error';
  } = {}
) {
  const { level = 'info' } = options;
  logger[level](entry);
}
