'use strict';

// Node.js EventSource driver. Browsers use ../browser/eventsource.js instead
// (see the "browser" field in package.json).
//
// eventsource >= 3 is ESM-only and exposes a named export; Node >= 22.12 can
// require() it synchronously.
module.exports = require('eventsource').EventSource;
