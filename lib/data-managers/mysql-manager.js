"use babel";

import mysql from 'mysql';
import DataManager from './data-manager';

export default class MysqlManager extends DataManager {
  constructor(dbConfig, connectionName) {
    super(dbConfig, connectionName);
    this.pool = null;
  }

  destroy() {
    if (this.pool) {
      this.pool.end((err) => {
        if (err)
          console.log(`Error closing the connection pool: ${err}`);
      });
    }
    this.pool = null;
  }

  execute(database, query, onQueryToken) {
    return new Promise((resolve, reject) => {
      var url = database !== '' ? this.dbConfig.getUrlWithDb(database) : this.dbConfig.getUrl();
      if (!this.pool || this.pool.config.connectionConfig.database !== database) {
        let config = {
          host: this.dbConfig.server,
          user: this.dbConfig.user,
          password: this.dbConfig.password,
          port: this.dbConfig.port,
          multipleStatements: true
        };

        if (database) {
          config.database = database;
        }
        this.pool = mysql.createPool(config);
      }

      this.pool.getConnection((err, connection) => {
        if (err)
          return reject(this.translateError(err));

        if (connection) {
          let q = connection.query( query, (err, results, fields) => {
            if (err)
              return reject(this.translateError(err));

            if (!fields || (fields.length && fields[0].constructor.name === 'FieldPacket')) {
              resolve(this.translateResults([results], [fields]));
            }
            else {
              resolve(this.translateResults(results, fields));
            }
            connection.release();
          });
          if (onQueryToken) {
            // give back some data so they can tell us to cancel the query if needed
            onQueryToken({ connection: connection, query: q });
          }
        }
      });
    });
  }

  cancelExecution(queryToken) {
    queryToken.connection.destroy();
  }

  // turn error into some useful string
  translateError(err) {
    return err.toString(); // dumb for now
  }

  // conver the results into what we expect so the UI doens't have to handle all different result types
  translateResults(results, fieldResults) {
    var translatedResults = [];

    for (var i = 0; i < results.length; i++) {
      let rows = results[i];

      if (this.isOkPacket(rows)) {
        let message = rows.message ? rows.message.toString() : `${rows.affectedRows} rows affected. ${rows.changedRows} changed.`;
        translatedResults.push({
          message: message,
          fields: [],
          rowCount: rows.affectedRows,
          rows: []
        });
      }
      else {
        let fields = fieldResults[i];
        let fieldData = fields.map(function(f) { return {name: f.name};});
        translatedResults.push({
          command: 'SELECT',
          fields: fieldData,
          rowCount: rows.length,
          rows: this.prepareRowData(rows, fields)
        });
      }
    }
    return translatedResults;
  }

  isOkPacket(row) {
    return row && row.constructor && row.constructor.name === 'OkPacket';
  }

  prepareRowData(rows, fields) {
    return rows.map(function(r) {
      return fields.map(function(f){
        return r[f.name];
      });
    });
  }

  checkSuperUser(callback) {
    callback();
  }

  getDatabaseNames() {
    return new Promise((resolve, reject) => {
      let query = `show databases`;

      let connection = mysql.createConnection({
        host: this.dbConfig.server,
        user: this.dbConfig.user,
        password: this.dbConfig.password,
        port: this.dbConfig.port
      });

      if (!connection) {
        console.error(err);
        return reject(err);
      }

      connection.query('SHOW DATABASES', (err, rows) => {
        if (err) {
          console.error(err);
          return reject(err);
        }

        connection.destroy();
        resolve(rows.map(x => { return x.Database; }));
      });
    });
  }

  getTables(database) {
    let query = `select table_schema, table_name, table_type from information_schema.tables WHERE table_schema='${database}' order by table_schema, table_type, table_name`;
    return this.execute(database, query)
    .then(results => {
      let tables = [];
      if (results && results.length && results[0].rows && results[0].rows.length) {
        for (var i = 0; i < results[0].rows.length; i++) {
          tables.push({
            schemaName: results[0].rows[i][0],
            name: results[0].rows[i][1],
            type: results[0].rows[i][2] === 'BASE TABLE' ? 'Table' : 'View'
          });
        }
      }
      return tables;
    });
  }

  getTableDetails(database, tables) {
    tableNames = tables.map((t) => t.name);
    var sqlTables = "('" + tableNames.join("','") +  "')";

    let query = `SELECT column_name, data_type, character_maximum_length, table_name
                  FROM information_schema.columns
                  WHERE table_schema='${database}'
                    AND table_name IN ${sqlTables}
                  ORDER BY table_name, ordinal_position`;
    return this.execute(database, query)
    .then(results => {
      let columns = [];
      for(var i = 0; i < results[0].rows.length; i++) {
        columns.push({
          name: results[0].rows[i][0],
          type: results[0].rows[i][1],
          udt: results[0].rows[i][1],
          size: results[0].rows[i][2],
          tableName: results[0].rows[i][3]
        });
      }
      return columns;
    });
  }

  getTableQuery(table) {
    return 'SELECT * FROM ' + table + ' LIMIT 100';
  }

  getDefaultSchema() {
    return this.defaultDatabase;
  }

  getSchemaNames(database) {
    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }
}
