"use babel";

import pg from 'pg';
import DataManager from './data-manager';

export default class PostgresManager extends DataManager {
  constructor(url) {
    super(url);

    this.config = {
      protocol: urlObj.protocol,
      user: urlObj.auth ? encodeURIComponent(urlObj.auth.split(':')[0]) : '',
      password: urlObj.auth ? encodeURIComponent(urlObj.auth.split(':')[1]) : '',
      server: urlObj.hostname // You can use 'localhost\\instance' to connect to named instance
    };
  }

  destroy() {
    pg.end();
  }

  execute(database, query, onSuccess, onError, onQueryToken) {
    var url = database !== '' ? this.getUrlWithDb(database) : this.getUrl();
    pg.connect(url, (err, client, done) => {
      if (err) {
        if (onError)
          onError(this.buildErrorMessage(err));
      }
      else {
        var pgQuery = client.query({text: query, rowMode: 'array', multiResult: true}, (err, results) => {
          if (err) {
            if (onError)
              onError(this.buildErrorMessage(err));
          }
          else if (onSuccess) {
            onSuccess(this.translateResults(results));
          }
        });
        if (onQueryToken) {
          // give back some data so they can tell us to cancel the query if needed
          onQueryToken({ client: client, query: pgQuery });
        }
      }
      // call `done()` to release the client back to the pool
      done();
    });
  }

  buildErrorMessage(err) {
    return err.toString();
  }

  cancelExecution(queryToken) {
    pg.cancel(queryToken.client.connectionParameters, queryToken.client, queryToken.query);
  }

  // conver the results into what we expect so the UI doens't have to handle all different result types
  translateResults(results) {
    var translatedResults = [];
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (result.command != 'SELECT') {
        translatedResults.push({ message: this.buildMessage(result), command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows });
      }
      else {
        translatedResults.push({ command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows });
      }
    }
    return translatedResults;
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
      case 'CREATE': str += 'Create successful.';
        break;
      default: str += JSON.stringify(results);
    }
    return str;
  }

  checkSuperUser(callback) {
    if(this.config.superUser === undefined) {
      this.execute(this.defaultDatabase, 'select usesuper from pg_user where usename = \'' + this.config.user + '\'',
        results => {
          if(results[0].rows.length > 0)
            this.config.superUser = results[0].rows[0][0];
          else
            this.config.superUser = false;
          callback();
        },
        err => {
          this.config.superUser = false;
          callback();
        }
      );
    } else {
      callback();
    }
  }

  getDatabaseNames(onNames) {
    if (!this.dbNames) {
      this.checkSuperUser(() => {
        var query = 'SELECT datname FROM pg_database ';
        if (!this.config.superUser)
          query += 'JOIN pg_user ON usesysid = datdba WHERE usename = \'' + this.config.user + '\' AND datistemplate = false ';
        else
          query += 'WHERE datistemplate = false ';
        query += 'order by datname;';
        this.execute('', query,
          results => {
            this.dbNames = [];
            for (var i = 0; i < results[0].rows.length; i++) {
              this.dbNames.push(results[0].rows[i][0]);
            }
            onNames(this.dbNames);
          },
          err => {this.dbNames = undefined;}
        );
      });
    }
    else {
      onNames(this.dbNames);
    }
  }

  getTables(database, onSuccess) {
    this.execute(database, 'SELECT table_schema, table_name ' +
                           'FROM information_schema.tables ' +
                           'WHERE substr(table_schema, 1, 3) != \'pg_\' and table_schema != \'information_schema\' ' +
                           'and table_type = \'BASE TABLE\' order by table_schema, table_name;',
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
        // TODO: error handling
      }
    );
  }

  getTableDetails(database, tables, onSuccess) {
    tableNames = tables.map((t) => t.name);
    var sqlTables = "('" + tableNames.join("','") +  "')";

    this.execute(database, 'select column_name, data_type, udt_name, character_maximum_length, table_name ' +
                           'from INFORMATION_SCHEMA.COLUMNS ' +
                           'where table_schema || \'.\' || table_name IN ' + sqlTables +
                           'or table_name IN ' + sqlTables +
                           ' order by table_name, ordinal_position;',
      results => {
        var columns = [];
        for(var i = 0; i < results[0].rows.length; i++) {
          columns.push({
            name: results[0].rows[i][0],
            type: results[0].rows[i][1],
            udt: results[0].rows[i][2],
            size: results[0].rows[i][3],
            tableName: results[0].rows[i][4]
          });
        }
        onSuccess(columns);
      },
      err => {
        // TODO: error handling
      }
    );
  }
}
