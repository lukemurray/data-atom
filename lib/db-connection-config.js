'use babel';

import URL from 'url';
import _s from 'underscore.string';

/**
 * Class of objects containing DB connection configuration which can be serialised to
 * and from a URL.
 */
export default class DbConnectionConfig {
  constructor() {
    if (typeof(arguments[0]) == 'string') {
      this.constructFromUrl(arguments[0]);
      console.debug('DbConnectionConfig constructed from url string : ' + JSON.stringify(this));
    } else {
      this.constructFromObject(arguments[0]);
      console.debug('DbConnectionConfig constructed from object : ' + JSON.stringify(this));
    }
  }

  constructFromUrl(url) {
    var urlObj = URL.parse(url, true);

    this.protocol = _s.rtrim(urlObj.protocol, ':');

    if (urlObj.auth) {
      var auth = urlObj.auth.split(':');
      this.user = auth[0];

      if (auth.length > 1)
        this.password = auth[1];
    }

    this.server = urlObj.hostname;
    this.port = urlObj.port;

    if (urlObj.pathname) {
      var instancename = urlObj.pathname.split('/').slice(1);
      this.dbName = instancename[instancename.length - 1];

      if (instancename.length > 1)
        this.instance = instancename[0];
    }

    if (urlObj.search)
      this.options = _s.ltrim(urlObj.search, '?').replace('&', ', ');
  }

  constructFromObject(obj) {
    this.protocol = obj.protocol;
    this.user = obj.user;
    this.password = obj.password;

    var serverInstance = obj.serverInstance.split('\\');

    this.server = serverInstance[0];

    if (serverInstance.length > 1)
      this.instance = serverInstance[1];

    this.port = obj.port;
    this.dbName = obj.dbName;
    this.options = obj.options;
  }

  getConnectionName() {
    return this.user + '@' + this.server;
  }

  getUrl() {
    return this.getUrlWithDb(this.dbName);
  }

  getUrlWithDb(dbName) {
    return encodeURIComponent(this.protocol) +
      '://' + encodeURIComponent(this.user) +
      ':' + encodeURIComponent(this.password) +
      '@' + encodeURIComponent(this.server) +
      (this.port ? ':' + encodeURIComponent(this.port) : '') +
      (this.instance ? '/' + encodeURIComponent(this.instance) : '') +
      '/' + encodeURIComponent(dbName) +
      (this.options ? '?' + this.options.replace(', ', '&') : '');
  }
}
