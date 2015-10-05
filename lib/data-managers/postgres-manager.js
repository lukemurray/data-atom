"use babel";

var pg = require('pg');
var DataManager = require('./data-manager');

module.exports =
class PostgresManager extends DataManager {
  constructor(url) {
    super(url);
  }

  execute(database, query, onSuccess, onError) {
    pg.connect(this.getUrlWithDb(database), (err, client, done) => {
      if (err) {
        console.error('Error connecting to database', err);
        onError(err);
      } else {
        client.query({text: query, rowMode: 'array', multiResult: true}, (err, results) => {
          // call `done()` to release the client back to the pool
          done();

          if (err) {
            if (onError)
              onError(err);
          } else if (onSuccess) {
            this.callOnSuccess(results, onSuccess);
          }
        });
      }
    });
  }

  // conver the results into what we expect so the UI doens't have to handle all different result types
  callOnSuccess(results, onSuccess) {
    var translatedResults = [];
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (result.command != 'SELECT') {
        translatedResults.push({ message: this.buildMessage(result), command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows });
      } else
        translatedResults.push({ command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows });
    }
    onSuccess(translatedResults);
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
      this.execute('', 'SELECT datname FROM pg_database WHERE datistemplate = false;',
        results => {
          this.dbNames = [];
          for (var i = 0; i < results[0].rows.length; i++) {
            this.dbNames.push(results[0].rows[i][0]);
          }
          onNames(this.dbNames);
        },
        err => this.dbNames = undefined);
    }
    else {
      onNames(this.dbNames);
    }
  }
}
