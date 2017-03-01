"use babel";

import sql from 'mssql';
import DataManager from './data-manager';

/* Note the following concerning connection pooling from the node-mssql docs.

Internally, each Connection instance is a separate pool of TDS connections. Once you create a new
Request/Transaction/Prepared Statement, a new TDS connection is acquired from the pool and reserved
for desired action. Once the action is complete, connection is released back to the pool. Connection
health check is built-in so once the dead connection is discovered, it is immediately replaced with
a new one.
*/

export default class SqlServerManager extends DataManager {
  constructor(dbConfig) {
    super(dbConfig);
  }

  buildError(err) {
    return 'Error (' + err.code + ') - ' + err.message;
  }

  execute(database, query, onQueryToken) {
    // console.debug("attempting to connect using " + this.dbConfig.getUrl())

    return new Promise((resolve, reject) => {
      var connection = new sql.Connection(this.dbConfig.getUrlWithDb(database),
        (err) => {
          if (err) {
            return reject(this.buildError(err));
          }
          // Query
          var request = new sql.Request(connection);
          request.multiple = true;
          if (onQueryToken)
            onQueryToken(request);
          request.query(query,
            (err, recordset) => {
              if (err) {
                return reject(this.buildError(err));
              }
              resolve(this.translateResults(recordset));
            }
          );
        }
      );
    });
  }

  cancelExecution(queryToken) {
    queryToken.cancel();
  }

  // convert the results into what we expect so the UI doens't have to handle all different result types
  translateResults(results) {
    // console.log(results);
    var translatedResults = [];
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      var fields = this.convertFieldsToViewModel(result.columns);
      var rows = this.convertRowsToViewModel(result);
      if (result.columns === undefined)
        translatedResults.push({
          message: this.buildMessage(result),
          command: result.command,
          fields: fields,
          rowCount: result.length,
          rows: rows
        });
      else
        translatedResults.push({
          command: result.command,
          fields: fields,
          rowCount: result.length,
          rows: rows
        });
    }
    return translatedResults;
  }

  convertFieldsToViewModel(cols) {
    var fields = [];
    for (var col in cols) {
      fields.push({
        name: cols[col].name
      });
    }
    return fields;
  }

  // take the model that mssql gives us and turn it into the expected model for the onSuccess call (that fills the views)
  convertRowsToViewModel(result) {
    // expect an array of results (if multiple commands executed)
    var rows = [];
    for (var i = 0; i < result.length; i++) {
      var r = result[i];
      var row = [];
      for (var val in r) {
        row.push(r[val]);
      }
      rows.push(row);
    }

    return rows;
  }

  buildMessage(results) {
    var str = '';
    switch (results.command) {
      case 'UPDATE':
        str += results.rowCount + ' rows updated.';
        break;
      case 'DELETE':
        str += results.rowCount + ' rows deleted.';
        break;
      case 'INSERT':
        str += results.rowCount + ' rows inserted.';
        break;
      default:
        str += JSON.stringify(results);
    }
    return str;
  }

  getDatabaseNames() {
    if (!this.dbNames) {
      return this.execute('master', 'SELECT name FROM master..sysdatabases')
        .then(results => {
          this.dbNames = [];
          for (var i = 0; i < results[0].rows.length; i++) {
            this.dbNames.push(results[0].rows[i][0]);
          }
          return this.dbNames;
        })
        .catch(err => {
          console.error('Error fetching databases:', err);
          this.dbNames = undefined;
          return [];
        });
    } else
      return Promise.resolve(this.dbNames);
  }

  getTables(database) {
    return this.execute(database, 'SELECT table_schema, table_name, table_type FROM information_schema.tables order by table_schema, table_type, table_name;')
      .then(results => {
        var tables = [];
        for (var i = 0; i < results[0].rows.length; i++) {
          tables.push({
            schemaName: results[0].rows[i][0],
            name: results[0].rows[i][1],
            type: results[0].rows[i][2] === 'BASE TABLE' ? 'Table' : 'View'
          });
        }
        return tables;
      })
      .catch(err => {
        console.error('Error fetching tables:', err);
        // TODO: error handling
      });
  }

  getTableDetails(database, tables) {
    tableNames = tables.map((t) => t.name);
    var sqlTables = "('" + tableNames.join("','") + "')";

    return this.execute(database, 'select column_name, data_type, character_maximum_length, table_name from INFORMATION_SCHEMA.COLUMNS where table_name IN ' + sqlTables + ' order by table_name, ordinal_position;')
      .then(results => {
        var columns = [];
        if (!results[0])
          return columns;

        for (var i = 0; i < results[0].rows.length; i++) {
          columns.push({
            name: results[0].rows[i][0],
            type: results[0].rows[i][1],
            size: results[0].rows[i][2],
            tableName: results[0].rows[i][3]
          });
        }
        return columns;
      })
      .catch(err => {
        console.error('Error fetching table information:', err);
        // TODO: error handling
      });
  }

  getTableQuery(table) {
    return 'SELECT TOP 100 * FROM ' + table;
  }
}
