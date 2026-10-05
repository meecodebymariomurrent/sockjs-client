
# SockJS-client

[![npm version](https://img.shields.io/npm/v/sockjs-client.svg?style=flat-square)](https://www.npmjs.com/package/sockjs-client)[![Dependencies](https://img.shields.io/librariesio/release/npm/sockjs-client.svg?style=flat-square)](https://libraries.io/npm/sockjs-client)[![Chat](https://img.shields.io/badge/Chat-gitter.im-blue.svg?style=flat-square)](https://gitter.im/sockjs/sockjs-client)[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg?style=flat-square)](CODE_OF_CONDUCT.md)
[![BrowserStack Status](https://automate.browserstack.com/badge.svg?badge_key=N3V0cStKM3RtUy9Bb2l2cHFhMVdobTZnUitBZ1lLcUkwYnl2TWgyMHppQT0tLWxncU5UeTdLb0Rqc1VQQTI5SklRelE9PQ==--596ccf9d3cd2f462f1043ee6803a9405e00446ac)](https://automate.browserstack.com/public-build/N3V0cStKM3RtUy9Bb2l2cHFhMVdobTZnUitBZ1lLcUkwYnl2TWgyMHppQT0tLWxncU5UeTdLb0Rqc1VQQTI5SklRelE9PQ==--596ccf9d3cd2f462f1043ee6803a9405e00446ac)

<a href="https://www.netlify.com">
  <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg"/>
</a>

# SockJS for enterprise

Available as part of the Tidelift Subscription.

The maintainers of SockJS and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-sockjs-client?utm_source=npm-sockjs-client&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

# Summary

SockJS is a browser JavaScript library that provides a WebSocket-like
object. SockJS gives you a coherent, cross-browser, Javascript API
which creates a low latency, full duplex, cross-domain communication
channel between the browser and the web server.

Under the hood SockJS tries to use native WebSockets first. If that
fails it can use a variety of browser-specific transport protocols and
presents them through WebSocket-like abstractions.

SockJS is intended to work for all modern browsers and in environments
which don't support the WebSocket protocol -- for example, behind restrictive
corporate proxies.

SockJS-client does require a server counterpart:

 * [SockJS-node](https://github.com/sockjs/sockjs-node) is a SockJS
   server for Node.js.


Philosophy:

 * The API should follow
   [HTML5 Websockets API](https://www.w3.org/TR/websockets/) as
   closely as possible.
 * All the transports must support cross domain connections out of the
   box. It's possible and recommended to host a SockJS server on a
   different server than your main web site.
 * There is support for at least one streaming protocol for every
   major browser.
 * Streaming transports should work cross-domain and
   should support cookies (for cookie-based sticky sessions).
 * Polling transports are used as a fallback for old browsers and
   hosts behind restrictive proxies.
 * Connection establishment should be fast and lightweight.
 * No Flash inside (no need to open port 843 - which doesn't work
   through proxies, no need to host 'crossdomain.xml', no need
   [to wait for 3 seconds](https://github.com/gimite/web-socket-js/issues/49)
   in order to detect problems)


Subscribe to
[SockJS mailing list](https://groups.google.com/forum/#!forum/sockjs) for
discussions and support.

# SockJS family

  * [SockJS-client](https://github.com/sockjs/sockjs-client) JavaScript client library
  * [SockJS-node](https://github.com/sockjs/sockjs-node) Node.js server
  * [SockJS-erlang](https://github.com/sockjs/sockjs-erlang) Erlang server
  * [SockJS-cyclone](https://github.com/flaviogrossi/sockjs-cyclone) Python/Cyclone/Twisted server
  * [SockJS-tornado](https://github.com/MrJoes/sockjs-tornado) Python/Tornado server
  * [SockJS-twisted](https://github.com/DesertBus/sockjs-twisted/) Python/Twisted server
  * [SockJS-aiohttp](https://github.com/aio-libs/sockjs/) Python/Aiohttp server
  * [Spring Framework](https://projects.spring.io/spring-framework) Java [client](https://docs.spring.io/spring-framework/docs/current/spring-framework-reference/web.html#websocket-fallback-sockjs-client) & server
  * [vert.x](https://github.com/vert-x/vert.x) Java/vert.x server
  * [Xitrum](https://xitrum-framework.github.io/) Scala server
  * [Atmosphere Framework](https://github.com/Atmosphere/atmosphere) JavaEE Server, Play Framework, Netty, Vert.x
  * [Actix SockJS](https://github.com/fafhrd91/actix-sockjs) Rust Server, Actix Framework

Work in progress:

  * [SockJS-ruby](https://github.com/nyarly/sockjs-ruby)
  * [SockJS-netty](https://github.com/cgbystrom/sockjs-netty)
  * [SockJS-gevent](https://github.com/ksava/sockjs-gevent) ([SockJS-gevent fork](https://github.com/njoyce/sockjs-gevent))
  * [pyramid-SockJS](https://github.com/fafhrd91/pyramid_sockjs)
  * [wildcloud-websockets](https://github.com/wildcloud/wildcloud-websockets)
  * [wai-SockJS](https://github.com/Palmik/wai-sockjs)
  * [SockJS-perl](https://github.com/vti/sockjs-perl)
  * [SockJS-go](https://github.com/igm/sockjs-go/)
  * [syp.biz.SockJS.NET](https://github.com/sypbiz/SockJS.NET) - .NET port of the SockJS client

# Getting Started

SockJS mimics the [WebSockets API](https://www.w3.org/TR/websockets/),
but instead of `WebSocket` there is a `SockJS` Javascript object.

First, you need to load the SockJS JavaScript library. For example, you can
put that in your HTML head:

```html
<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
```

After the script is loaded you can establish a connection with the
SockJS server. Here's a simple example:

```javascript
 var sock = new SockJS('https://mydomain.com/my_prefix');
 sock.onopen = function() {
     console.log('open');
     sock.send('test');
 };

 sock.onmessage = function(e) {
     console.log('message', e.data);
     sock.close();
 };

 sock.onclose = function() {
     console.log('close');
 };

```

# SockJS-client API

## SockJS class

Similar to the 'WebSocket' API, the 'SockJS' constructor takes one or more arguments:

```javascript
var sockjs = new SockJS(url, _reserved, options);
```

`url` may contain a query string, if one is desired.

Where `options` is a hash which can contain:

 *  **server (string)**

    String to append to url for actual data connection. Defaults to a random 4 digit number.

 *  **transports (string OR array of strings)**

    Sometimes it is useful to disable some fallback transports. This
    option allows you to supply a list transports that may be used by
    SockJS. By default all available transports will be used.

 *  **sessionId (number OR function)**

    Both client and server use session identifiers to distinguish connections.
    If you specify this option as a number, SockJS will use its random string
    generator function to generate session ids that are N-character long
    (where N corresponds to the number specified by **sessionId**).
    When you specify this option as a function, the function must return a
    randomly generated string. Every time SockJS needs to generate a session
    id it will call this function and use the returned string directly.
    If you don't specify this option, the default is to use the default random
    string generator to generate 8-character long session ids.

  * **timeout (number)**

    Specify a minimum timeout in milliseconds to use for the transport connections.
    By default this is dynamically calculated based on the measured RTT and
    the number of expected round trips. This setting will establish a minimum,
    but if the calculated timeout is higher, that will be used.

Although the 'SockJS' object tries to emulate the 'WebSocket'
behaviour, it's impossible to support all of its features. An
important SockJS limitation is the fact that you're not allowed to
open more than one SockJS connection to a single domain at a time.
This limitation is caused by an in-browser limit of outgoing
connections - usually [browsers don't allow opening more than two
outgoing connections to a single domain](https://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser). A single SockJS session
requires those two connections - one for downloading data, the other for
sending messages.  Opening a second SockJS session at the same time
would most likely block, and can result in both sessions timing out.

Opening more than one SockJS connection at a time is generally a
bad practice. If you absolutely must do it, you can use
multiple subdomains, using a different subdomain for every
SockJS connection.

# Supported transports

SockJS 2.0 targets current browsers and Node.js. The legacy transports that
only existed for Internet Explorer 6-9, Opera Presto and similar browsers
(`xdr-streaming`, `xdr-polling`, `htmlfile`, `jsonp-polling` and the
`iframe-*` variants) were removed. Servers still advertise them, the client
simply never uses them. Use an older 1.x release if you need those browsers.

_Browser_             | _Websockets_ | _Streaming_   | _Polling_
----------------------|--------------|---------------|-------------------
Chrome, Edge, Firefox, Safari, Opera (current) | rfc6455 | xhr-streaming | xhr-polling

Internet Explorer is not supported and is no longer tested.
`eventsource` is used as a streaming transport where `EventSource` is available.
The transports are tried in the order websocket, xhr-streaming, eventsource,
xhr-polling, so a connection behind a proxy that blocks WebSockets falls back to
the HTTP transports automatically.

# Supported transports, by name

_Transport_          | _References_
---------------------|---------------
websocket (rfc6455)  | [rfc 6455][^10]
xhr-streaming        | Transport using [Cross domain XHR][^5] [streaming][^7] capability (readyState=3).
eventsource          | [EventSource/Server-sent events][^4].
xhr-polling          | Long-polling using [cross domain XHR][^5].


[^4]: https://html.spec.whatwg.org/multipage/comms.html#server-sent-events
[^5]: https://secure.wikimedia.org/wikipedia/en/wiki/XMLHttpRequest#Cross-domain_requests
[^7]: http://www.debugtheweb.com/test/teststreaming.aspx
[^10]: https://www.rfc-editor.org/rfc/rfc6455.txt


# Connecting to SockJS without the client

Although the main point of SockJS is to enable browser-to-server
connectivity, it is possible to connect to SockJS from an external
application. Any SockJS server complying with 0.3 protocol does
support a raw WebSocket url. The raw WebSocket url for the test server
looks like:

 * ws://localhost:8081/echo/websocket

You can connect any WebSocket RFC 6455 compliant WebSocket client to
this url. This can be a command line client, external application,
third party code or even a browser (though I don't know why you would
want to do so).


# Deployment

You should use a version of sockjs-client
that supports the protocol used by your server. For example:

```html
<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
```


For server-side deployment tricks, especially about load balancing and
session stickiness, take a look at the
[SockJS-node readme](https://github.com/sockjs/sockjs-node#readme).


### Node.js

When used from Node.js (not in a browser), sockjs-client requires Node.js 22 or newer
and uses [ws](https://github.com/websockets/ws) for the WebSocket transport.
Options for it can be given via `transportOptions`:

```javascript
var sock = new SockJS('https://mydomain.com/my_prefix', null, {
  transportOptions: {
    websocket: {
      headers: {Authorization: 'Bearer ...'},  // extra handshake headers
      ca: [fs.readFileSync('ca.pem')],         // or tls: {ca: ..., rejectUnauthorized: ...}
      ping: 30                                 // send a ping frame every 30 seconds
      // any other `ws` client option, e.g. agent, origin, handshakeTimeout
    }
  }
});
```

# Development and testing

SockJS-client needs [node.js](https://nodejs.org/) for running a test
server and JavaScript minification. If you want to work on
SockJS-client source code, checkout the git repo and follow these
steps:

    cd sockjs-client
    npm install

To generate JavaScript, run:

    gulp browserify

To generate minified JavaScript, run:

    gulp browserify:min

Both commands output into the `build` directory.

## Testing

Automated testing provided by:

<a href="https://browserstack.com"><img src="img/Browserstack-logo@2x.png" height="50"></a>

Once you've compiled the SockJS-client you may want to check if your changes
pass all the tests.

    npm run test:browser_local

This will start [karma](https://karma-runner.github.io) and a test support server.

# Browser Quirks

There are various browser quirks which we don't intend to address:

 * Pressing ESC in Firefox, before Firefox 20, closes the SockJS connection. For a workaround
   and discussion see [#18](https://github.com/sockjs/sockjs-client/issues/18).
 * You can't open more than one SockJS connection to one domain at the
   same time due to [the browser's limit of concurrent connections](https://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser)
   (this limit is not counting native WebSocket connections).
 * Although SockJS is trying to escape any strange Unicode characters
   (even invalid ones - [like surrogates \xD800-\xDBFF](https://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates) or [\xFFFE and \xFFFF](https://en.wikipedia.org/wiki/Unicode#Character_General_Category))
   it's advisable to use only valid characters. Using invalid
   characters is a bit slower, and may not work with SockJS servers
   that have proper Unicode support.
 * Having a global function called `onmessage` or such is probably a
   bad idea, as it could be called by the built-in `postMessage` API.
 * From SockJS' point of view there is nothing special about
   SSL/HTTPS. Connecting between unencrypted and encrypted sites
   should work just fine.
 * Although SockJS does its best to support both prefix and cookie based
   sticky sessions, the latter may not work well cross-domain with
   browsers that don't accept third-party cookies by default (Safari).
   In order to get around this make sure you're connecting to SockJS
   from the same parent domain as the main site. For example
   'sockjs.a.com' is able to set cookies if you're connecting from
   'www.a.com' or 'a.com'.
 * Trying to connect from secure "https://" to insecure "http://" is
   not a good idea. The other way around should be fine.
 * Long polling is known to cause problems on Heroku, but a
   [workaround for SockJS is available](https://github.com/sockjs/sockjs-node/issues/57#issuecomment-5242187).
 * SockJS [websocket transport is more stable over SSL](https://github.com/sockjs/sockjs-client/issues/94). If
   you're a serious SockJS user then consider using SSL
   ([more info](https://www.ietf.org/mail-archive/web/hybi/current/msg01605.html)).
