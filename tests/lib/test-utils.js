'use strict';

var SockJS = require('../../lib/entry')
  , urlUtils = require('../../lib/utils/url')
  ;

module.exports = {
  getSameOriginUrl: function () {
    if (global.location) {
      return urlUtils.getOrigin(global.location.href) + '/sockjs-test';
    }
    return 'http://localhost:8081';
  }

, getCrossOriginUrl: function () {
    if (global.clientOptions) {
      return global.clientOptions.url;
    }
    return null;
  }

, getUrl: function (path) {
    return /^http/.test(path) ? path : this.getSameOriginUrl() + path;
  }

, newSockJs: function (path, transport) {
    return new SockJS(this.getUrl(path), null, { transports: transport });
  }

};
