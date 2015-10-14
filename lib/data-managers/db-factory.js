"use babel";

import fs from 'fs';
import URL from 'url';
import CSON from 'season';

class DbFactory {
  getSupportedDatabases() {
    return [
      {name: 'PostgreSQL', prefix: 'postgresql', port: 5432},
      {name: 'MS SQL Server', prefix: 'sqlserver', port: 1433}
    ];
  }

  loadConnections(callback) {
    this.readFile((connections) => {
      for(var key in connections) {
        var connection = connections[key];
        if (!connection.url)
          connection.url = connection.protocol + '://' + connection.user + ':' + connection.password + '@' + connection.server + (connection.port ? ':' + connection.port : '') + '/' + connection.database;
      }
      callback(connections);
    });
  }

  // TODO: Do not save same connection multiple times
  saveConnection(connection, callback) {
    this.readFile((connections) => {
      connections.push(connection);
      this.writeFile(connections, callback);
    });
  }

  readFile(callback) {
    fs.exists(this.file(), (exists) => {
      if (exists) {
        let connections = CSON.readFileSync(this.file()) || [];
        callback(connections);
      } else {
        fs.writeFile(this.file(), '[]', () => callback([]));
      }
    });
  }

  writeFile(connections, callback) {
    CSON.writeFileSync(this.file(), connections);
    if(callback)
      callback();
  }

  file() {
    let filename = 'data-atom-connections.cson';
    let filedir = atom.getConfigDirPath();
    return `${filedir}/${filename}`;
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

export default factory;
