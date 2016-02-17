"use babel";

import mysql from 'mysql';
import DataManager from './data-manager';

export default class MysqlManager extends DataManager {
  constructor(url) {
    super(url);
    this.pool = null;
  }

  destroy() {
    this.connection.end();
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

    console.log(url);

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
        let message = rows.message || `${rows.affectedRows} rows affected. ${rows.changedRows} changed.`;

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

      onNames(rows.map(function(x) { return x.Database; }));
      connection.destroy();
    });
  }

  getTableNames(database, onNames) {
    let query = `select table_name from information_schema.tables WHERE table_schema='${database}'`;
    this.execute(database, query, results => {
      if (results && results.length && results[0].rows && results[0].rows.length) {
        onNames(results[0].rows.map(function(r) { return r[0]; }));
      } else {
        onNames([]);
      }
    });
  }

  getTableDetails(database, tables, onSuccess) {
    var sqlTables = "('" + tables.join("','") +  "')";

    let query = `SELECT column_name,data_type, character_maximum_length
                  FROM information_schema.columns
                  WHERE table_schema='${database}'
                    AND table_name IN ${sqlTables}`;
    this.execute(database, query, results => {
      let columns = [];
      for(var i = 0; i < results[0].rows.length; i++) {
        columns.push({
          name: results[0].rows[i][0],
          type: results[0].rows[i][1],
          udt: results[0].rows[i][1],
          size: results[0].rows[i][2]
        });
      }
      onSuccess(columns);
    });
  }
}
