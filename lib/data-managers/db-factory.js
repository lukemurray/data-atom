"use babel";

import fs from 'fs';
import URL from 'url';
import CSON from 'season';
import {NotificationManager} from 'atom';

import Utils from '../utils.js';
import DbConnectionConfig from '../db-connection-config.js'

class DbFactory {
  getSupportedDatabases() {
    return [
      {name: 'PostgreSQL', prefix: 'postgresql', port: 5432},
      {name: 'MS SQL Server', prefix: 'mssql', port: 1433},
      {name: 'MySQL', prefix: 'mysql', port: 3306}
    ];
  }

  loadConnections() {
    return this.readFile().then(connections => {
      for (var key in connections) {
        connections[key] = new DbConnectionConfig(connections[key]);
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

  // TODO: convert this method to take DbConnectionConfig as arg?
  createDataManagerForUrl(url) {
    dbConfig = new DbConnectionConfig(url);

    switch (dbConfig.protocol) {
      case 'mysql': {
        var MysqlManager = require('./mysql-manager');
        return new MysqlManager(dbConfig);
      }
      case 'postgres':
      case 'postgresql': {
        var PostgresManager = require('./postgres-manager');
        return new PostgresManager(dbConfig);
      }
      case 'mssql': {
        var SqlServerManager = require('./sqlserver-manager');
        return new SqlServerManager(dbConfig);
      }
      default:
        return null;
    }
  }
}

var factory = new DbFactory();

export default factory;
