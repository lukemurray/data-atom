"use babel";

import mysql from 'mysql';
import DataManager from './data-manager';

export default class MysqlManager extends DataManager {
  constructor(url) {
    super(url);
    this.pool = null;
  }

  destroy() {
    this.pool.end((err) -> {
      if (err)
        console.log(`Error closing the connection pool: ${err}`);
    });
    this.pool = null;
  }

  execute(database, query, onSuccess, onError, onQueryToken) {
    var url = database !== '' ? this.getUrlWithDb(database) : this.getUrl();
    if (!this.pool) {
      let config = {
        host: this.config.server,
        user: this.config.user,
        password: this.config.password,
        port: this.config.port,
        multipleStatements: true
      };

      if (database) {
        config.database = database;
      }
      this.pool = mysql.createPool(config);
    }

    this.pool.getConnection((err, connection) => {
      if (err && onError) {
        onError(err);
        return;
      }

      if (connection) {
        connection.query( query, (err, results, fields) => {
          if (err && onError) {
            onError(err);
            return;
          }

          if (!fields || (fields.length && fields[0].constructor.name === 'FieldPacket')) {
            onSuccess(this.translateResults([results], [fields]));
          } else {
            onSuccess(this.translateResults(results, fields));
          }
          connection.release();
        });
      }
    });
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
      } else {
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
        return "" + r[f.name];
      });
    });
  }

  checkSuperUser(callback) {
    callback();
  }

  getDatabaseNames(onNames) {
    onNames([]);
    let query = `show databases`;

    let connection = mysql.createConnection({
      host: this.config.server,
      user: this.config.user,
      password: this.config.password,
      port: this.config.port
    });

    if (!connection) {
      console.error(err);
      return;
    }

    connection.query('SHOW DATABASES', (err, rows) => {
      if (err) {
        console.error(err);
        return;
      }

      onNames(rows.map(function(x) { return x.Database;}));
      connection.destroy();
    });
  }

  getTables(database, onSuccess) {
    let query = `select table_schema, table_name, table_type from information_schema.tables WHERE table_schema='${database}' order by table_schema, table_type, table_name`;
    this.execute(database, query, results => {
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
      onSuccess(tables);
    });
  }

  getTableDetails(database, tables, onSuccess) {
    tableNames = tables.map((t) => t.name);
    var sqlTables = "('" + tableNames.join("','") +  "')";

    let query = `SELECT column_name, data_type, character_maximum_length, table_name
                  FROM information_schema.columns
                  WHERE table_schema='${database}'
                    AND table_name IN ${sqlTables}
                  ORDER BY table_name, ordinal_position`;
    this.execute(database, query, results => {
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
      onSuccess(columns);
    });
  }
}
