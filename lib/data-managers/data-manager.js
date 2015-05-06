"use babel";

var URL = require('url');
var _s = require('underscore.string');

module.exports =
class DataManager {
  constructor(url) {
    this.url = url;
    var urlObj = URL.parse(url);
    this.config = {
      user: urlObj.auth.split(':')[0],
      password: urlObj.auth.split(':')[1],
      server: urlObj.hostname, // You can use 'localhost\\instance' to connect to named instance
      database: _s.ltrim(urlObj.pathname, '/')
    };

    if (urlObj.port) {
      this.config.port = urlObj.port;
    }
  }

  execute(query, onSuccess, onError) {}

  destroy() {}

  getConnectionName() {
    return this.config.user + '@' + this.config.server + '/' + this.config.database;
  }

  getDatabaseNames() {}
}
