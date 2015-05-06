"use babel";

var pg = require('pg');
var DataManager = require('./data-manager');

module.exports =
class PostgresManager extends DataManager {
  constructor(url) {
    super(url);
  }

  execute(query, onSuccess, onError) {
    pg.connect(this.url, (err, client, done) => {
      if (err) {
        console.error('Error connecting to database', err);
        onError(err);
      } else {
        client.query({text: query, rowMode: 'array'}, (err, result) => {
          // call `done()` to release the client back to the pool
          done();

          if (err) {
            console.error('Query error - ' + err);
            if (onError)
              onError(err);
          } else if (onSuccess) {
            this.callOnSuccess(result, onSuccess);
          }
        });
      }
    });
  }

  // conver the results into what we expect so the UI doens't have to handle all different result types
  callOnSuccess(result, onSuccess) {
    if (result.command != 'SELECT')
      onSuccess({ message: this.buildMessage(result), command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows });
    else
      onSuccess({ command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows });
  }

  buildMessage(results) {
    var str = '';
    switch (results.command) {
      case 'UPDATE': str += results.rowCount + ' rows updated.';
        break;
      case 'DELETE': str += results.rowCount + ' rows deleted.';
        break;
      default: str += JSON.stringify(results);
    }
    return str;
  }
}
