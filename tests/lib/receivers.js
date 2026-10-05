'use strict';

var expect = require('expect.js')
  , EventSourceReceiver = require('../../lib/transport/receiver/eventsource')
  , XhrReceiver = require('../../lib/transport/receiver/xhr')
  , XhrFake = require('../support/xhr-fake')
  ;

// Both browsers and the Node `eventsource` package (an EventTarget since
// v3) require real Event objects in dispatchEvent().
function messageEvent(data) {
  return new MessageEvent('message', { data: data });
}

describe('Receivers', function () {
  describe('xhr', function () {
    var oldTimeout;
    before(function () {
      oldTimeout = XhrFake.timeout;
      XhrFake.timeout = 100;
    });
    after(function () {
      XhrFake.timeout = oldTimeout;
    });

    it('emits multiple messages for multi-line response', function (done) {
      var test = this.runnable();
      var xhr = new XhrReceiver('test', XhrFake);
      var i = 0, responses = ['test', 'multiple', 'lines', '{}'];
      xhr.on('message', function (msg) {
        try {
          expect(msg).to.equal(responses[i]);
        } catch (e) {
          done(e);
          xhr.abort();
          return;
        }
        i++;
      });
      xhr.on('close', function (code, reason) {
        if (test.timedOut || test.duration) {
          return;
        }
        try {
          expect(reason).to.equal('network');
        } catch (e) {
          done(e);
          return;
        }
        done();
      });
      xhr._chunkHandler(200, 'test\nmultiple\nlines');
    });

    it('emits no messages for an empty string response', function (done) {
      var test = this.runnable();
      var xhr = new XhrReceiver('test', XhrFake);
      var i = 0, responses = ['{}'];
      xhr.on('message', function (msg) {
        try {
          expect(i).to.be.lessThan(responses.length);
          expect(msg).to.equal(responses[i]);
        } catch (e) {
          done(e);
          xhr.abort();
          return;
        }
        i++;
      });
      xhr.on('close', function (code, reason) {
        if (test.timedOut || test.duration) {
          return;
        }
        try {
          expect(reason).to.equal('network');
        } catch (e) {
          done(e);
          return;
        }
        done();
      });
      xhr._chunkHandler(200, '');
    });

    it('aborts without sending a message', function (done) {
      var test = this.runnable();
      var xhr = new XhrReceiver('test', XhrFake);
      xhr.on('message', function () {
        done(new Error());
        xhr.abort();
      });
      xhr.on('close', function (code, reason) {
        if (test.timedOut || test.duration) {
          return;
        }
        try {
          expect(reason).to.equal('user');
        } catch (e) {
          done(e);
          return;
        }
        done();
      });
      xhr.abort();
    });
  });

  describe('eventsource', function () {
    it('receives data', function(done) {
      var eventSourceReceiver = new EventSourceReceiver('http://127.0.0.1:1/test');

      eventSourceReceiver.on('message', function(msg) {
        try {
          expect(msg).to.equal('datadataaa');
        } catch (e) {
          eventSourceReceiver.abort();
          return done(e);
        }
        eventSourceReceiver.abort();
        done();
      });

      eventSourceReceiver.es.dispatchEvent(messageEvent('datadataaa'));
    });

    it('correctly escapes characters', function(done) {
      var eventSourceReceiver = new EventSourceReceiver('http://127.0.0.1:1/test');

      eventSourceReceiver.on('message', function(msg) {
        try {
          expect(msg).to.equal('{ \\"lastName\\":\\"#@%!~`%^&*()\\" }');
        } catch (e) {
          eventSourceReceiver.abort();
          return done(e);
        }
        eventSourceReceiver.abort();
        done();
      });

      eventSourceReceiver.es.dispatchEvent(messageEvent('{ \\"lastName\\":\\"#@%!~`%^&*()\\" }'));
    });
  });
});
