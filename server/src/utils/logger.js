const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const colorize = (color, message) => {
  if (process.env.NODE_ENV === 'production') return message;
  return `${colors[color]}${message}${colors.reset}`;
};

const formatTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  error: (message, meta = {}) => {
    console.error(
      `${colorize('gray', `[${formatTimestamp()}]`)} ${colorize('red', '[ERROR]')} ${message}`,
      ...(Object.keys(meta).length ? [meta] : [])
    );
  },

  warn: (message, meta = {}) => {
    console.warn(
      `${colorize('gray', `[${formatTimestamp()}]`)} ${colorize('yellow', '[WARN]')} ${message}`,
      ...(Object.keys(meta).length ? [meta] : [])
    );
  },

  info: (message, meta = {}) => {
    console.info(
      `${colorize('gray', `[${formatTimestamp()}]`)} ${colorize('blue', '[INFO]')} ${message}`,
      ...(Object.keys(meta).length ? [meta] : [])
    );
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'production') return;
    console.debug(
      `${colorize('gray', `[${formatTimestamp()}]`)} ${colorize('cyan', '[DEBUG]')} ${message}`,
      ...(Object.keys(meta).length ? [meta] : [])
    );
  },
};

export { LOG_LEVELS };
export default logger;