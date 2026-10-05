'use strict';

module.exports = [
  // streaming transports
  require('./transport/websocket')
, require('./transport/xhr-streaming')
, require('./transport/eventsource')

  // polling transports
, require('./transport/xhr-polling')
];
