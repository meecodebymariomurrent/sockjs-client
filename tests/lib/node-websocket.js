'use strict';

// Characterization tests for the Node.js WebSocket driver
// (lib/transport/driver/websocket.js) and the websocket transport built on top
// of it. They describe the contract that consumers rely on and must stay green
// regardless of the underlying WebSocket implementation.
//
// The peer is a plain `ws` server so the tests do not depend on the client
// implementation under test.

var expect = require('expect.js')
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , WebSocketServer = require('ws').WebSocketServer
  , Driver = require('../../lib/transport/driver/websocket')
  , WebSocketTransport = require('../../lib/transport/websocket')
  ;

var certDir = path.join(__dirname, '..', 'support', 'certs')
  , cert = fs.readFileSync(path.join(certDir, 'localhost.crt'))
  , key = fs.readFileSync(path.join(certDir, 'localhost.key'))
  ;

function startServer(secure, onConnection, cb) {
  var httpServer = secure ?
    https.createServer({ cert: cert, key: key }) : http.createServer();
  var wss = new WebSocketServer({ server: httpServer });
  wss.on('connection', onConnection);
  httpServer.listen(0, '127.0.0.1', function() {
    cb({
      port: httpServer.address().port
    , close: function(done) {
        wss.clients.forEach(function(c) { c.terminate(); });
        wss.close(function() {
          httpServer.close(function() { done && done(); });
        });
      }
    });
  });
}

describe('Node WebSocket driver', function() {
  this.timeout(10000);

  var server;
  afterEach(function(done) {
    if (!server) {
      return done();
    }
    var s = server;
    server = null;
    s.close(done);
  });

  it('exports a constructor on Node', function() {
    expect(Driver).to.be.a('function');
    expect(WebSocketTransport.enabled()).to.equal(true);
  });

  it('delivers text frames to onmessage as strings', function(done) {
    startServer(false, function(ws) {
      ws.send('hello');
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], {});
      client.onmessage = function(e) {
        try {
          expect(e.data).to.be.a('string');
          expect(e.data).to.equal('hello');
          client.close();
          done();
        } catch (err) {
          done(err);
        }
      };
    });
  });

  it('delivers unicode frames intact', function(done) {
    var msg = 'héllo 世界 😀';
    startServer(false, function(ws) {
      ws.on('message', function(data) { ws.send(data.toString()); });
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], {});
      client.onopen = function() { client.send(msg); };
      client.onmessage = function(e) {
        try {
          expect(e.data).to.equal(msg);
          client.close();
          done();
        } catch (err) {
          done(err);
        }
      };
    });
  });

  it('sends frames to the server', function(done) {
    startServer(false, function(ws) {
      ws.on('message', function(data, isBinary) {
        try {
          expect(isBinary).to.equal(false);
          expect(data.toString()).to.equal('from client');
          done();
        } catch (err) {
          done(err);
        }
      });
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], {});
      client.onopen = function() { client.send('from client'); };
    });
  });

  it('reports the close code and reason sent by the server', function(done) {
    startServer(false, function(ws) {
      ws.close(4001, 'bye');
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], {});
      client.onclose = function(e) {
        try {
          expect(e.code).to.equal(4001);
          expect(e.reason).to.equal('bye');
          done();
        } catch (err) {
          done(err);
        }
      };
    });
  });

  it('close() closes the connection on the server side', function(done) {
    startServer(false, function(ws) {
      ws.on('close', function(code) {
        try {
          expect(code).to.be.a('number');
          done();
        } catch (err) {
          done(err);
        }
      });
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], {});
      client.onopen = function() { client.close(); };
    });
  });

  it('sends custom headers given in the options', function(done) {
    startServer(false, function(ws, req) {
      try {
        expect(req.headers['x-test-header']).to.equal('sockjs');
        done();
      } catch (err) {
        done(err);
      }
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], {
        headers: { 'X-Test-Header': 'sockjs' }
      });
      client.onerror = function() {};
    });
  });

  it('signals failure when the server is unreachable', function(done) {
    // grab a free port, then close it so the connection is refused
    var tmp = http.createServer();
    tmp.listen(0, '127.0.0.1', function() {
      var port = tmp.address().port;
      tmp.close(function() {
        var client = new Driver('ws://127.0.0.1:' + port + '/', [], {});
        var finished = false;
        function finish() {
          if (!finished) {
            finished = true;
            done();
          }
        }
        client.onerror = finish;
        client.onclose = finish;
      });
    });
  });

  it('rejects a self-signed wss server by default', function(done) {
    startServer(true, function() {}, function(s) {
      server = s;
      var client = new Driver('wss://localhost:' + s.port + '/', [], {});
      var finished = false;
      client.onopen = function() {
        finished = true;
        client.close();
        done(new Error('connection to untrusted server must not open'));
      };
      function failed() {
        if (!finished) {
          finished = true;
          done();
        }
      }
      client.onerror = failed;
      client.onclose = failed;
    });
  });

  it('connects to a wss server when the CA is passed via the "ca" option', function(done) {
    startServer(true, function(ws) {
      ws.send('secure');
    }, function(s) {
      server = s;
      var client = new Driver('wss://localhost:' + s.port + '/', [], { ca: [cert] });
      client.onmessage = function(e) {
        try {
          expect(e.data).to.equal('secure');
          client.close();
          done();
        } catch (err) {
          done(err);
        }
      };
      client.onerror = function(e) { done(new Error('unexpected error ' + (e && e.message))); };
    });
  });

  it('connects to a wss server when the CA is passed via the "tls" option', function(done) {
    startServer(true, function(ws) {
      ws.send('secure');
    }, function(s) {
      server = s;
      var client = new Driver('wss://localhost:' + s.port + '/', [], { tls: { ca: [cert] } });
      client.onmessage = function(e) {
        try {
          expect(e.data).to.equal('secure');
          client.close();
          done();
        } catch (err) {
          done(err);
        }
      };
      client.onerror = function(e) { done(new Error('unexpected error ' + (e && e.message))); };
    });
  });

  it('uses a custom http agent given in the "agent" option (proxy hook)', function(done) {
    var used = 0;
    var agent = new http.Agent();
    var createConnection = agent.createConnection;
    agent.createConnection = function() {
      used++;
      return createConnection.apply(this, arguments);
    };
    startServer(false, function(ws) {
      ws.send('via agent');
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], { agent: agent });
      client.onmessage = function(e) {
        try {
          expect(e.data).to.equal('via agent');
          expect(used).to.equal(1);
          client.close();
          agent.destroy();
          done();
        } catch (err) {
          done(err);
        }
      };
      client.onerror = function(e) { done(new Error('unexpected error ' + (e && e.message))); };
    });
  });

  it('sends ping frames at the interval given in the "ping" option', function(done) {
    startServer(false, function(ws) {
      ws.on('ping', function() { done(); });
    }, function(s) {
      server = s;
      var client = new Driver('ws://127.0.0.1:' + s.port + '/', [], { ping: 1 });
      client.onerror = function() {};
    });
  });
});

describe('websocket transport on Node', function() {
  this.timeout(10000);

  var server;
  afterEach(function(done) {
    if (!server) {
      return done();
    }
    var s = server;
    server = null;
    s.close(done);
  });

  it('appends /websocket and maps http to ws', function(done) {
    startServer(false, function(ws, req) {
      try {
        expect(req.url).to.equal('/echo/000/session/websocket');
        done();
      } catch (err) {
        done(err);
      }
    }, function(s) {
      server = s;
      var t = new WebSocketTransport('http://127.0.0.1:' + s.port + '/echo/000/session', null, {});
      t.on('close', function() {});
    });
  });

  it('wraps outgoing messages as a JSON array and emits incoming frames', function(done) {
    startServer(false, function(ws) {
      ws.on('message', function(data) {
        try {
          expect(data.toString()).to.equal('["x"]');
          ws.send('a["y"]');
        } catch (err) {
          done(err);
        }
      });
    }, function(s) {
      server = s;
      var t = new WebSocketTransport('http://127.0.0.1:' + s.port, null, {});
      var send = function() { t.send(JSON.stringify('x')); };
      // the driver buffers nothing before open, so wait for the first tick
      setTimeout(send, 200);
      t.on('message', function(m) {
        try {
          expect(m).to.equal('a["y"]');
          t.close();
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('emits close(1006) when the connection cannot be established', function(done) {
    var tmp = http.createServer();
    tmp.listen(0, '127.0.0.1', function() {
      var port = tmp.address().port;
      tmp.close(function() {
        var t = new WebSocketTransport('http://127.0.0.1:' + port, null, {});
        t.on('close', function(code) {
          try {
            expect(code).to.equal(1006);
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });
  });
});
