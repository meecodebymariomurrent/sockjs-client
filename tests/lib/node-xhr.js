'use strict';

// Node.js XHR driver: the status passed along with streamed chunks must be the
// real HTTP status, otherwise error bodies would be parsed as stream data.

var expect = require('expect.js')
  , http = require('http')
  , XhrDriver = require('../../lib/transport/driver/xhr')
  , XhrReceiver = require('../../lib/transport/receiver/xhr')
  ;

function startServer(handler, cb) {
  var server = http.createServer(handler);
  server.listen(0, '127.0.0.1', function() {
    cb('http://127.0.0.1:' + server.address().port + '/', function() { server.close(); });
  });
}

describe('Node XHR driver', function() {
  this.timeout(10000);

  it('reports the real status code with each chunk', function(done) {
    startServer(function(req, res) {
      res.writeHead(200);
      res.end('hello\n');
    }, function(url, stop) {
      var x = new XhrDriver('GET', url, null);
      var statuses = [];
      x.on('chunk', function(status, text) {
        statuses.push(status);
        expect(text).to.contain('hello');
      });
      x.on('finish', function(status) {
        stop();
        try {
          expect(status).to.equal(200);
          expect(statuses).to.eql([200]);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('does not report error response bodies as 200 chunks', function(done) {
    startServer(function(req, res) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<html>\nNot Found\n</html>\n');
    }, function(url, stop) {
      var x = new XhrDriver('GET', url, null);
      var chunkStatuses = [];
      x.on('chunk', function(status) {
        chunkStatuses.push(status);
      });
      x.on('finish', function(status, text) {
        stop();
        try {
          expect(status).to.equal(404);
          expect(text).to.contain('Not Found');
          expect(chunkStatuses).to.not.contain(200);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('streaming receiver ignores the body of an error response', function(done) {
    startServer(function(req, res) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('a["injected"]\nh\n');
    }, function(url, stop) {
      var receiver = new XhrReceiver(url, XhrDriver);
      receiver.on('message', function(m) {
        stop();
        done(new Error('error body must not be delivered as a message: ' + m));
      });
      receiver.on('close', function(code, reason) {
        stop();
        try {
          expect(reason).to.equal('permanent');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
