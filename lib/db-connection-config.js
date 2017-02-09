'use babel';

import URL from 'url';
import _s from 'underscore.string';

/**
 * Class of objects containing DB connection configuration which can be serialised to
 * and from a URL.
 */
export default class DbConnectionConfig {
  constructor(url) {
    var urlObj = URL.parse(url, true);

    if (!urlObj) return;

    this.protocol = urlObj.protocol.substring(0, urlObj.protocol.length - 1);

    var auth = urlObj.auth.split(':');
    this.user = auth[0];

    if (auth.length > 1)
      this.password = auth[1];

    this.server = urlObj.hostname;
    this.port = urlObj.port;

    var instancename = urlObj.pathname.split('/').slice(1);
    this.dbName = instancename[instancename.length - 1];

    if (instancename.length > 1)
      this.instance = instancename[0];

    this.options = _s.ltrim(urlObj.search, '?');
  }

  getConnectionName() {
    return this.user + '@' + this.server;
  }

  getUrl() {
    return this.getUrlWithDb(this.dbName);
  }

  getUrlWithDb(dbName) {
    return this.protocol +
      '://' + this.user +
      ':' + this.password +
      '@' + this.server +
      (this.port ? ':' + this.port : '') +
      (this.instance ? '/' + this.instance : '') +
      '/' + dbName +
      (this.options ? '?' + this.options : '');
  }
}
