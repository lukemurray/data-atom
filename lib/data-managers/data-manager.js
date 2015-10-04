"use babel";

var URL = require('url');
var _s = require('underscore.string');

module.exports =
class DataManager {
  constructor(url) {
    var urlObj = URL.parse(url);
    this.activeDatabase = _s.ltrim(urlObj.pathname, '/');
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

  execute(query, onSuccess, onError) {}

  getUrl() {
    return this.config.protocol + '//' + this.config.user + ':' + this.config.password + '@' + this.config.server + (this.config.port ? ':' + this.config.port : '') + '/' + this.activeDatabase;
  }

  destroy() {}

  getConnectionName() {
    return this.config.user + '@' + this.config.server;
  }

  getDatabaseNames(onNames) {}
}
