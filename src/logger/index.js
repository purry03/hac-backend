const log4js = require('log4js');

log4js.configure({
  appenders: {
    default: {
      type: 'file', filename: 'server.log', flags: 'w', layout: { type: 'pattern', pattern: '[%r] %p %m' },
    },
  },
  categories: { default: { appenders: ['default'], level: 'debug', enableCallStack: true } },
});

const logger = log4js.getLogger();

logger.level = 'debug';

function info(msg) {
  logger.info(msg);
}

function err(msg) {
  logger.error(msg);
}

function error(msg) {
  logger.error(msg);
}

module.exports = { info, err, error };
