import pino from 'pino';

const logger = pino();

export function log(
  entry : unknown,
  options : {
    level? : 'info' | 'error';
  } = {}
) {
  const { level = 'info' } = options;
  logger[level](entry);
}
