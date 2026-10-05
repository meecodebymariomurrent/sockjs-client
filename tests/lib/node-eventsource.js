'use strict';

// Characterization tests for the Node.js EventSource driver and receiver.
// They describe the contract the eventsource transport relies on and must
// stay green regardless of the underlying EventSource implementation.

var expect = require('expect.js')
  , http = require('http')
  , EventSourceTransport = require('../../lib/transport/eventsource')
  , EventSourceReceiver = require('../../lib/transport/receiver/eventsource')
  ;

function startServer(handler, cb) {
  var sockets = [];
  var server = http.createServer(handler);
  server.on('connection', function(s) { sockets.push(s); });
  server.listen(0, '127.0.0.1', function() {
    cb({
      url: 'http://127.0.0.1:' + server.address().port + '/'
    , close: function(done) {
        sockets.forEach(function(s) { s.destroy(); });
        server.close(function() { done && done(); });
      }
    });
  });
}

function sse(res) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
}

describe('Node EventSource transport', function() {
  this.timeout(10000);

  var server;
  var receiver;
  afterEach(function(done) {
    if (receiver) {
      receiver.removeAllListeners();
      if (receiver.es) {
        receiver.abort();
      }
      receiver = null;
    }
    if (!server) {
      return done();
    }
    var s = server;
    server = null;
    s.close(done);
  });

  it('is enabled on Node', function() {
    expect(EventSourceTransport.enabled()).to.equal(true);
    expect(EventSourceTransport.transportName).to.equal('eventsource');
  });

  it('requests the stream with an event-stream Accept header', function(done) {
    startServer(function(req, res) {
      try {
        expect(req.headers.accept).to.contain('text/event-stream');
        done();
      } catch (err) {
        done(err);
      }
      sse(res);
    }, function(s) {
      server = s;
      receiver = new EventSourceReceiver(s.url);
    });
  });

  it('emits one message per event', function(done) {
    var seen = [];
    startServer(function(req, res) {
      sse(res);
      res.write('data: a["one"]\n\n');
      res.write('data: a["two"]\n\n');
    }, function(s) {
      server = s;
      receiver = new EventSourceReceiver(s.url);
      receiver.on('message', function(m) {
        seen.push(m);
        if (seen.length === 2) {
          try {
            expect(seen).to.eql(['a["one"]', 'a["two"]']);
            done();
          } catch (err) {
            done(err);
          }
        }
      });
    });
  });

  it('percent-decodes message data, tolerating a lone percent sign', function(done) {
    var seen = [];
    startServer(function(req, res) {
      sse(res);
      res.write('data: a["%41%20b"]\n\n');
      res.write('data: a["100% done"]\n\n');
    }, function(s) {
      server = s;
      receiver = new EventSourceReceiver(s.url);
      receiver.on('message', function(m) {
        seen.push(m);
        if (seen.length === 2) {
          try {
            expect(seen).to.eql(['a["A b"]', 'a["100% done"]']);
            done();
          } catch (err) {
            done(err);
          }
        }
      });
    });
  });

  it('abort() closes the receiver with reason "user"', function(done) {
    startServer(function(req, res) {
      sse(res);
      res.write('data: o\n\n');
    }, function(s) {
      server = s;
      receiver = new EventSourceReceiver(s.url);
      receiver.on('message', function() {
        receiver.abort();
      });
      receiver.on('close', function(code, reason) {
        try {
          expect(code).to.equal(null);
          expect(reason).to.equal('user');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('closes the receiver when the server answers with an error status', function(done) {
    startServer(function(req, res) {
      res.writeHead(404);
      res.end();
    }, function(s) {
      server = s;
      receiver = new EventSourceReceiver(s.url);
      receiver.on('close', function(code, reason) {
        try {
          expect(code).to.equal(null);
          // eventsource 2.x reported 'network' here, spec-compliant 5.x reports
          // 'permanent'. Only streaming transports use this and both end the
          // transport, so accept either.
          expect(['network', 'permanent']).to.contain(reason);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('closes with reason "network" when the server is unreachable', function(done) {
    var tmp = http.createServer();
    tmp.listen(0, '127.0.0.1', function() {
      var port = tmp.address().port;
      tmp.close(function() {
        receiver = new EventSourceReceiver('http://127.0.0.1:' + port + '/');
        receiver.on('close', function(code, reason) {
          try {
            expect(code).to.equal(null);
            expect(reason).to.equal('network');
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });
  });
});
