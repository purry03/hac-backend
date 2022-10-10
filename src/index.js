const express = require('express');
const bodyParser = require('body-parser');

const api = require('./api');
const config = require('./config');
const logger = require('./logger');

const app = express();
app.use(bodyParser.json());

for (version in api) {
  app.use(`/${version}`, api[version]);
}

app.use((error, req, res, next) => {
  // Error handling middleware functionality
  console.log(`error ${error.message}`); // log the error
  const status = error.statusCode || 400;
  const errorMessage = error.json.message || error.toString();
  logger.error(`${status} : `, errorMessage);
  // send back an easily understandable error message to the caller
  res.status(status).json({ error: errorMessage });
});

app.listen(config.PORT, (err) => {
  if (err) {
    logger.error(err.toString());
    return;
  }
  logger.info('Server online on port 3000');
});

process.on('uncaughtException', (err) => {
  logger.err(`Uncaught exception: ${err}`);
});
