'use strict';

// Node.js WebSocket driver. Browsers use ../browser/websocket.js instead (see
// the "browser" field in package.json).
//
// This is a thin adapter over `ws` that keeps the option names that used to
// be accepted by faye-websocket (via `transportOptions.websocket`), so
// existing consumers keep working:
//   headers   - extra handshake headers
//   tls       - options for tls.connect(), e.g. { ca, rejectUnauthorized }
//   ca        - shortcut for tls.ca
//   ping      - interval in seconds at which ping frames are sent
//   maxLength - maximum incoming message size in bytes (maps to maxPayload)
// Any other option is passed on to `ws` unchanged (e.g. agent, origin,
// handshakeTimeout, perMessageDeflate). The faye-websocket "proxy", "net" and
// "extensions" options are not supported; use `agent` for proxies.

var WebSocket = require('ws');

var FAYE_ONLY = ['tls', 'ping', 'maxLength', 'proxy', 'net', 'extensions'];

function toWsOptions(options) {
  var out = {
    // faye-websocket never negotiated permessage-deflate; keep it opt-in
    perMessageDeflate: false
  };
  var key;
  options = options || {};

  for (key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key) && FAYE_ONLY.indexOf(key) === -1) {
      out[key] = options[key];
    }
  }
  if (options.tls) {
    for (key in options.tls) {
      if (Object.prototype.hasOwnProperty.call(options.tls, key)) {
        out[key] = options.tls[key];
      }
    }
  }
  if (options.maxLength) {
    out.maxPayload = options.maxLength;
  }
  return out;
}

function WebSocketDriver(url, protocols, options) {
  var ws = new WebSocket(url, protocols && protocols.length ? protocols : undefined, toWsOptions(options));

  // ws emits 'error' as an EventEmitter event; without a listener it would
  // throw once the owner has detached its own handlers (e.g. after close()).
  ws.on('error', function() {});

  var pingSeconds = options && options.ping;
  if (pingSeconds > 0) {
    var timer = setInterval(function() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, pingSeconds * 1000);
    if (timer.unref) {
      timer.unref();
    }
    ws.on('close', function() {
      clearInterval(timer);
    });
  }

  return ws;
}

module.exports = WebSocketDriver;
