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

  execute(query, onSuccess, onError) {
    var connection = new sql.Connection({user: this.config.user, password: this.config.password, server: this.config.server, database: this.activeDatabase},
      (err) => {
        if (err) {
          console.error(err);
          onError(this.buildError(err));
          return;
        }

        // Query
        var request = connection.request();
        request.query(query,
          (err, recordset) => {
            if (err) {
              console.error(err);
              onError(this.buildError(err));
              return;
            }
            console.log(recordset);
            callOnSuccess(recordset, onSuccess);
          });
      });
  }

  // conver the results into what we expect so the UI doens't have to handle all different result types
  callOnSuccess(result, onSuccess) {
    // console.log result
    if (results.command != 'SELECT')
      onSuccess([{ message: @buildMessage(results), command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows }]);
    else
      onSuccess([{ command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows }]);
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
}
