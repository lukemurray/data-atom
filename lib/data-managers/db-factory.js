"use babel";

import fs from 'fs';
import URL from 'url';
import CSON from 'season';
import {NotificationManager} from 'atom';

import Utils from '../utils.js';

class DbFactory {
  getSupportedDatabases() {
    return [
      {name: 'PostgreSQL', prefix: 'postgresql', port: 5432},
      {name: 'MS SQL Server', prefix: 'sqlserver', port: 1433},
      {name: 'MySQL', prefix: 'mysql', port: 3306}
    ];
  }

  loadConnections() {
    return this.readFile().then(connections => {
      for(var key in connections) {
        var connection = connections[key];
        if (!connection.url) {
          connection.url = connection.protocol + '://' + connection.user + ':' + connection.password + '@' + connection.server + (connection.port ? ':' + connection.port : '') + '/' + connection.database;
          if (connection.options) {
            connection.url += '?' + Utils.buildDbOptions(connection.options);
          }
        }
      }
      return connections;
    });
  }

  // TODO: Do not save same connection multiple times
  saveConnection(connection) {
    return this.readFile().then(connections => {
      connections.push(connection);
      this.writeFile(connections);
    });
  }

  readFile() {
    return new Promise((resolve, reject) => {
      fs.exists(this.file(), (exists) => {
        if (exists) {
          let connections = CSON.readFileSync(this.file()) || [];
          resolve(connections);
        } else {
          fs.writeFile(this.file(), '[]', () => resolve([]));
        }
      });
    });
  }

  writeFile(connections) {
    CSON.writeFileSync(this.file(), connections);
  }

  file() {
    let filename = 'data-atom-connections.cson';
    let filedir = atom.getConfigDirPath();
    return `${filedir}/${filename}`;
  }

  createDataManagerForUrl(url) {
    var protocol = URL.parse(url).protocol.replace(':', '');
    switch (protocol) {
      case 'mysql': {
        var MysqlManager = require('./mysql-manager');
        return new MysqlManager(url);
      }
      case 'postgres':
      case 'postgresql': {
        var PostgresManager = require('./postgres-manager');
        return new PostgresManager(url);
      }
      case 'sqlserver': {
        var SqlServerManager = require('./sqlserver-manager');
        return new SqlServerManager(url);
      }
      default:
        return null;
    }
  }
}

var factory = new DbFactory();

export default factory;
