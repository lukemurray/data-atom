"use babel";

import sql from 'mssql';
import DataManager from './data-manager';

export default class SqlServerManager extends DataManager {
  constructor(url) {
    super(url);
  }

  buildError(err) {
    return 'Error (' + err.code + ') - ' + err.message;
  }

  execute(database, query, onSuccess, onError, onQueryToken) {
    var connection = new sql.Connection({user: this.config.user, password: this.config.password, server: this.config.server, database: database, port: this.config.port},
      (err) => {
        if (err) {
          if (onError) {
            onError(this.buildError(err));
          }
          return;
        }
        // Query
        var request = new sql.Request(connection);
        request.multiple = true;
        request.query(query,
          (err, recordset) => {
            if (err) {
              if (onError) {
                onError(this.buildError(err));
              }
              return;
            }
            if (onSuccess) {
              onSuccess(this.translateResults(recordset));
            }
          }
        );
        if (onQueryToken)
          onQueryToken(request);
      }
    );
  }

  cancelExecution(queryToken) {
    queryToken.cancel();
  }

  // conver the results into what we expect so the UI doens't have to handle all different result types
  translateResults(results, onSuccess) {
    // console.log(results);
    var translatedResults = [];
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      var fields = this.convertFieldsToViewModel(result.columns);
      var rows = this.convertRowsToViewModel(result);
      if (result.columns === undefined)
        translatedResults.push({ message: this.buildMessage(result), command: result.command, fields: fields, rowCount: result.length, rows: rows });
      else
        translatedResults.push({ command: result.command, fields: fields, rowCount: result.length, rows: rows });
    }
    return translatedResults;
  }

  convertFieldsToViewModel(cols) {
    var fields = [];
    for (var col in cols) {
      fields.push({name: cols[col].name});
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
      case 'UPDATE': str += results.rowCount + ' rows updated.';
        break;
      case 'DELETE': str += results.rowCount + ' rows deleted.';
        break;
      case 'INSERT': str += results.rowCount + ' rows inserted.';
        break;
      default: str += JSON.stringify(results);
    }
    return str;
  }

  getDatabaseNames(onNames) {
    if (!this.dbNames) {
      this.execute('master', 'SELECT name FROM master..sysdatabases',
        results => {
          this.dbNames = [];
          for (var i = 0; i < results[0].rows.length; i++) {
            this.dbNames.push(results[0].rows[i][0]);
          }
          onNames(this.dbNames);
        },
        err => {
          console.error('Error fetching databases:', err);
          this.dbNames = undefined;
        });
    } else
      onNames(this.dbNames);
  }

  getTables(database, onSuccess) {
    this.execute(database, 'SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = \'BASE TABLE\' order by table_schema, table_name;',
      results => {
        var tables = [];
        for (var i = 0; i < results[0].rows.length; i++) {
          tables.push({
            schemaName: results[0].rows[i][0],
            name: results[0].rows[i][1]
          });
        }
        onSuccess(tables);
      },
      err => {
        console.error('Error fetching tables:', err);
        // TODO: error handling
      }
    );
  }

  getTableDetails(database, tables, onSuccess) {
    tableNames = tables.map((t) => t.name);
    var sqlTables = "('" + tableNames.join("','") +  "')";

    this.execute(database, 'select column_name, data_type, character_maximum_length, table_schema from INFORMATION_SCHEMA.COLUMNS where table_name IN ' + sqlTables + ' order by table_name, ordinal_position;',
      results => {
        var columns = [];
        for(var i = 0; i < results[0].rows.length; i++) {
          columns.push({
            name: results[0].rows[i][0],
            type: results[0].rows[i][1],
            size: results[0].rows[i][2],
            tableName: results[0].rows[i][3]
          });
        }
        onSuccess(columns);
      },
      err => {
        console.error('Error fetching table information:', err);
        // TODO: error handling
      }
    );
  }
}
