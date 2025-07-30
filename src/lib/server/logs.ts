import pino from 'pino';

const logger = pino();

export function log(
  entry : unknown,
  options : {
    level ?: 'info' | 'error';
  } = {},
) {
  const { level = 'info' } = options;
  if (entry && (typeof entry === 'object') && !(Array.isArray(entry))) {
    if (!('type' in entry)) entry = { ...entry, type : 'app' };
  }
  logger[level](entry);
}
