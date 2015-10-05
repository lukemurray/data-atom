"use babel";

var sql = require('mssql');
var DataManager = require('./data-manager');

module.exports =
class SqlServerManager extends DataManager {
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
          for (var i = 0; i < results[0].length; i++) {
            this.dbNames.push(results[0][i].name);
          }
          onNames(this.dbNames);
        },
        err => this.dbNames = undefined);
    } else
      onNames(this.dbNames);
  }
}
