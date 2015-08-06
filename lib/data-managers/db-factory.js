"use babel";

var URL = require('url');

class DbFactory {
  getSupportedDatabases() {
    return [
      {name: 'PostgreSQL', prefix: 'postgresql', port: 5432},
      {name: 'MS SQL Server', prefix: 'sqlserver', port: 1433}
    ];
  }
  
  createDataManagerForUrl(url) {
    var protocol = URL.parse(url).protocol.replace(':', '');
    switch (protocol) {
      case 'postgresql': {
        var PostgresManager = require('./postgres-manager');
        return new PostgresManager(url);
      }
      case 'sqlserver': {
        var SqlServerManager = require('./sqlserver-manager');
        return new SqlServerManager(url);
      }
      default:
        throw Error('Unsupported database: ' + URL.parse(url).protocol)
    }
  }
}

var factory = new DbFactory();

module.exports = factory;
