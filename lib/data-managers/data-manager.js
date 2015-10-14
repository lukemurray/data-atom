"use babel";

import URL from 'url';
import _s from 'underscore.string';

/**
 * Base DataManager. Manges the communication to a database server
 */
export default class DataManager {
  constructor(url) {
    var urlObj = URL.parse(url);
    this.defaultDatabase = _s.ltrim(urlObj.pathname, '/');
    this.config = {
      protocol: urlObj.protocol,
      user: urlObj.auth ? urlObj.auth.split(':')[0] : '',
      password: urlObj.auth ? urlObj.auth.split(':')[1] : '',
      server: urlObj.hostname // You can use 'localhost\\instance' to connect to named instance
    };

    if (urlObj.port) {
      this.config.port = urlObj.port;
    }
  }

  execute(database, query, onSuccess, onError) {}
  cancelExecution(queryToken) {}

  getUrl() {
    return this.getUrlWithDb(this.defaultDatabase);
  }

  getUrlWithDb(dbName) {
    return this.getUrlNoDb() + '/' + dbName;
  }

  getUrlNoDb() {
    return this.config.protocol + '//' + this.config.user + ':' + this.config.password + '@' + this.config.server + (this.config.port ? ':' + this.config.port : '');
  }

  destroy() {}

  getConnectionName() {
    return this.config.user + '@' + this.config.server;
  }

  getDatabaseNames(onNames) {}
}
