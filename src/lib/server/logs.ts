import pino from 'pino';
import { NODE_ENV } from '$env/static/private';

const logger = (NODE_ENV === 'development')
  ? pino({ transport : { target : 'pino-pretty' } })
  : pino();

export function log(
  entry : unknown,
  options : {
    level ?: 'info' | 'warn' | 'error';
  } = {},
) {
  const { level = 'info' } = options;
  if (entry && (typeof entry === 'object') && !(Array.isArray(entry))) {
    if (!('type' in entry)) entry = { ...entry, type : 'app' };
  }
  logger[level](entry);
}
