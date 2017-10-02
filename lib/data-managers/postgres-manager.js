"use babel";

import pg from 'pg';
import DataManager from './data-manager';

export default class PostgresManager extends DataManager {
  constructor(dbConfig, connectionName) {
    super(dbConfig, connectionName);
  }

  destroy() {
    pg.end();
  }

  execute(database, query, onQueryToken) {
    return new Promise((resolve, reject) => {
      var url = database !== '' ? this.dbConfig.getUrlWithDb(database) : this.dbConfig.getUrl();
      pg.connect(url, (err, client, done) => {
        if (err) {
          // call `done()` to release the client back to the pool
          done();
          reject(this.buildErrorMessage(err));
        }
        else {
          var pgQuery = client.query({text: query, rowMode: 'array', multiResult: true}, (err, results) => {
            if (err) {
              done();
              reject(this.buildErrorMessage(err));
            }
            else {
              done();
              resolve(this.translateResults(results));
            }
          });
          if (onQueryToken) {
            // give back some data so they can tell us to cancel the query if needed
            onQueryToken({ client: client, query: pgQuery });
          }
        }
      });
    });
  }

  buildErrorMessage(err) {
    return err.toString() + '\n' + (err.where || '');
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

  checkSuperUser() {
    if (this.dbConfig.superUser === undefined) {
      return this.execute(this.defaultDatabase, 'select usesuper from pg_user where usename = \'' + this.dbConfig.user + '\'')
      .then(results => {
        if(results[0].rows.length > 0)
          this.dbConfig.superUser = results[0].rows[0][0];
        else
          this.dbConfig.superUser = false;
      })
      .catch(err => {
        this.dbConfig.superUser = false;
      });
    }
    else
      return Promise.resolve();
  }

  getDatabaseNames() {
    if (!this.dbNames) {
      return this.checkSuperUser().then(() => {
        var query = 'SELECT datname FROM pg_database ';
        if (!this.dbConfig.superUser)
          query += 'JOIN pg_user ON usesysid = datdba WHERE usename = \'' + this.dbConfig.user + '\' AND datistemplate = false ';
        else
          query += 'WHERE datistemplate = false ';
        query += 'order by datname;';
        return this.execute('', query)
        .then(results => {
          this.dbNames = [];
          for (var i = 0; i < results[0].rows.length; i++) {
            this.dbNames.push(results[0].rows[i][0]);
          }
          return this.dbNames;
        })
        .catch(err => { this.dbNames = undefined; });
      })
      .catch(err => { this.dbNames = undefined; });
    }
    else
      return Promise.resolve(this.dbNames);
  }

  getTables(database) {
    return this.execute(database, 'SELECT table_schema, table_name, table_type ' +
                           'FROM information_schema.tables ' +
                           'WHERE substr(table_schema, 1, 3) != \'pg_\' and table_schema != \'information_schema\' ' +
                           'order by table_schema, table_type, table_name;')
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
      return Promise.resolve([]);
    });
  }

  getTableDetails(database, tables) {
    tableNames = tables.map((t) => t.name);
    var sqlTables = "('" + tableNames.join("','") +  "')";

    return this.execute(database, 'select column_name, data_type, udt_name, character_maximum_length, table_name ' +
                           'from INFORMATION_SCHEMA.COLUMNS ' +
                           'where table_schema || \'.\' || table_name IN ' + sqlTables +
                           'or table_name IN ' + sqlTables +
                           ' order by table_name, ordinal_position;')
    .then(results => {
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
      return columns;
    })
    .catch(err => {
      return Promise.resolve([])
    });
  }

  getTableQuery(table) {
    return 'SELECT * FROM ' + table + ' LIMIT 100';
  }

  getDefaultSchema() {
    return 'public';
  }
}
