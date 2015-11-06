"use babel";

import pg from 'pg';
import DataManager from './data-manager';

export default class PostgresManager extends DataManager {
  constructor(url) {
    super(url);
  }

  destroy() {
    pg.end();
  }

  execute(database, query, onSuccess, onError, onQueryToken) {
    var url = database !== '' ? this.getUrlWithDb(database) : this.getUrl();
    pg.connect(url, (err, client, done) => {
      if (err) {
        if (onError)
          onError(err);
      }
      else {
        var pgQuery = client.query({text: query, rowMode: 'array', multiResult: true}, (err, results) => {
          if (err && onError) {
            onError(err);
          }
          else if (onSuccess) {
            onSuccess(this.translateResults(results));
          }
          // call `done()` to release the client back to the pool
          done();
        });
        if (onQueryToken) {
          // give back some data so they can tell us to cancel the query if needed
          onQueryToken({ client: client, query: pgQuery });
        }
      }
    });
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
      default: str += JSON.stringify(results);
    }
    return str;
  }

  checkSuperUser(callback) {
    if(this.config.superUser == undefined) {
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
          err => {this.dbNames = undefined}
        );
      });
    }
    else {
      onNames(this.dbNames);
    }
  }

  getTableNames(database, onNames) {
    this.execute(database, 'SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\' and table_type = \'BASE TABLE\' order by table_name;',
      results => {
        var tableNames = [];
        for (var i = 0; i < results[0].rows.length; i++) {
          tableNames.push(results[0].rows[i][0]);
        }
        onNames(tableNames);
      },
      err => {
        // TODO: error handling
      }
    );
  }

  getTableDetails(database, tables, onSuccess) {
    var sqlTables = "('" + tables.join("','") +  "')";
    var query = 'WITH table_constraints AS (' +
	    'SELECT ' +
  	    'tc.constraint_name, tc.constraint_type, tc.table_name, ' +
        'tc.constraint_schema, kcu.column_name, ' +
        'ccu.table_name AS foreign_table_name, ' +
  	    'ccu.column_name AS foreign_column_name ' +
    	'FROM ' +
  	    'information_schema.table_constraints AS tc ' +
  	    'JOIN information_schema.key_column_usage AS kcu ' +
  	      'ON tc.constraint_name = kcu.constraint_name ' +
  	    'JOIN information_schema.constraint_column_usage AS ccu ' +
	        'ON ccu.constraint_name = tc.constraint_name ' +
	    'WHERE tc.constraint_type <> \'UNIQUE\' AND tc.table_name in ' + sqlTables + ' ' +
    ') ' +
    'SELECT c.column_name, c.data_type, c.udt_name, c.character_maximum_length, tc.constraint_type ' +
    'FROM INFORMATION_SCHEMA.COLUMNS c ' +
    'LEFT JOIN table_constraints AS tc ON c.table_schema = tc.constraint_schema AND tc.table_name = c.table_name AND tc.column_name = c.column_name ' +
    'WHERE c.table_name = ' + sqlTables + ';';

    this.execute(database, query,
      results => {
        var columns = [];
        for(var i = 0; i < results[0].rows.length; i++) {
          columns.push({
            name: results[0].rows[i][0],
            type: results[0].rows[i][1],
            udt: results[0].rows[i][2],
            size: results[0].rows[i][3],
            constraint: results[0].rows[i][4]
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
