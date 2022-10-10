const express = require('express');
const container = require('./container');

const router = express();

router.use('/container', container);

module.exports = router;
