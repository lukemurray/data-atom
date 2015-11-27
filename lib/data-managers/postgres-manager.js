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

  getTableNames(database, type, onNames) {
    var query = 'SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\' and table_type = \'' + type + '\' order by table_name;';
    this.execute(database, query,
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

  getSequences(database, onSuccess) {
    this.execute(database, 'SELECT sequence_name FROM information_schema.sequences',
      results => {
        var sequences = [];
        for(var i = 0; i < results[0].rows.length; i++) {
          this.execute(database, 'SELECT * FROM ' + results[0].rows[i][0],
            results => {
              for(var j = 0; j < results; j++) {
                // TODO: build sequences
              }
            },
            err => {
              // TODO: error handling
            }
          );
        }
      },
      err => {
        // TODO: error handling
      }
    );
  }

  getCreateStatement(database, table, onSuccess) {
    var stmt = '-- Table: ' + table + '\n\n-- DROP TABLE ' + table + '\n\nCREATE TABLE ' + table + '\n(\n';
    var query = "SELECT " +
      "E'\t' || array_to_string(array_agg(col), E',\n\t') || E',\n' " +
      "FROM " +
      "( " +
        "SELECT " +
          "cast(c.column_name || ' ' || data_type || " +
          "case when is_nullable = 'NO' then ' NOT NULL' else '' end || " +
          "case when column_default <> '' then ' DEFAULT ' || column_default else '' end as text) as col, " +
          "c.table_name " +
        "FROM information_schema.columns c " +
        "WHERE c.table_name = '" + table + "' " +
      ") AS tabledefinition " +
      "GROUP BY table_name";
    this.execute(database, query,
      results => {
        stmt += results[0].rows[0][0];
        query = "SELECT " +
          "E'\t' || array_to_string(array_agg(col), E',\n\t') || E'\n' " +
          "FROM " +
          "( " +
            "WITH constraints as (SELECT " +
              "tc.constraint_name, tc.constraint_type, tc.table_name, " +
              "tc.constraint_schema, kcu.column_name, " +
              "ccu.table_name AS foreign_table_name, " +
              "ccu.column_name AS foreign_column_name, " +
              "CASE WHEN pgc.confupdtype = 'a' THEN 'NO ACTION' " +
              "WHEN pgc.confupdtype = 'r' THEN 'RESTRICT' " +
              "WHEN pgc.confupdtype = 'c' THEN 'CASCADE' " +
              "WHEN pgc.confupdtype = 'n' THEN 'SET NULL' " +
              "WHEN pgc.confupdtype = 'd' THEN 'SET DEFAULT' " +
              "ELSE '' " +
              "END AS on_update, " +
              "CASE WHEN pgc.confdeltype = 'a' THEN 'NO ACTION' " +
              "WHEN pgc.confdeltype = 'r' THEN 'RESTRICT' " +
              "WHEN pgc.confdeltype = 'c' THEN 'CASCADE' " +
              "WHEN pgc.confdeltype = 'n' THEN 'SET NULL' " +
              "WHEN pgc.confdeltype = 'd' THEN 'SET DEFAULT' " +
              "ELSE '' " +
              "END AS on_delete, " +
              "CASE WHEN pgc.confmatchtype = 'f' THEN 'FULL' " +
              "WHEN pgc.confmatchtype = 'p' THEN 'PARTIAL' " +
              "WHEN pgc.confmatchtype = 'u' THEN 'SIMPLE' " +
              "WHEN pgc.confmatchtype = 's' THEN 'SIMPLE' " +
              "ELSE '' " +
              "END AS match " +
            "FROM " +
            "information_schema.table_constraints AS tc " +
            "JOIN information_schema.key_column_usage AS kcu " +
              "ON tc.constraint_name = kcu.constraint_name " +
            "JOIN information_schema.constraint_column_usage AS ccu " +
      	     "ON ccu.constraint_name = tc.constraint_name " +
            "JOIN pg_constraint as pgc " +
                "ON pgc.conname = tc.constraint_name " +
            "WHERE tc.constraint_type <> 'UNIQUE' AND tc.table_name = 'files' " +
            "ORDER BY tc.constraint_type DESC " +
            ") " +
            "select " +
              "'CONSTRAINT ' || constraint_name || ' ' || constraint_type || ' (' || column_name || ')' || " +
              "CASE WHEN constraint_type = 'FOREIGN KEY' THEN E'\n\tREFERENCES ' || foreign_table_name || ' (' || foreign_column_name || ')' || " +
              "CASE WHEN match <> '' THEN ' MATCH ' || match ELSE '' END || E'\n\t' || " +
              "CASE WHEN on_update <> '' THEN 'ON UPDATE ' || on_update ELSE '' END || " +
              "CASE WHEN on_delete <> '' THEN ' ON DELETE ' || on_delete ELSE '' END " +
              "ELSE '' END as col, table_name " +
            "from constraints" +
          ") AS tabledefinition " +
          "GROUP BY table_name";
        this.execute(database, query,
          results => {
            stmt += results[0].rows[0][0] + ')\nWITH (\n\tOIDS=FALSE\n);\nALTER TABLE ' + table + '\n\tOWNER TO ' + database + ';';
            onSuccess(stmt);
          },
          err => {
            // TODO: error handling
          }
        );
      },
      err => {
        // TODO: error handling
      }
    );
  }

  getSelectStatement(database, table, onSuccess) {
    var query = "SELECT " +
      "'SELECT ' || array_to_string(array_agg(column_name), E', ') || ' FROM ' || relname || ';' " +
      "FROM " +
      "( " +
        "SELECT " +
          "c.relname, a.attname AS column_name " +
        "FROM pg_class c, " +
         "pg_attribute a, " +
         "pg_type t " +
         "WHERE c.relname = '" + table + "' " +
         "AND a.attnum > 0 " +
         "AND a.attrelid = c.oid " +
         "AND a.atttypid = t.oid " +
       "ORDER BY a.attnum " +
      ") as tabledefinition " +
      "group by relname";
    this.execute(database, query,
      results => {
        onSuccess(results[0].rows[0][0]);
      },
      err => {
       // TODO: error handling
      }
    );
  }

  getInsertStatement(database, table, onSuccess) {
    var query = "SELECT " +
      "'INSERT INTO ' || relname || '(' || array_to_string(array_agg(column_name), E', ') || ')' || " +
      " E'\n' || 'VALUES ' || '(' || array_to_string(array_agg(column_value), E', ') || ');' " +
      "FROM " +
      "( " +
        "SELECT " +
          "c.relname, a.attname AS column_name, CAST('?' AS text) AS column_value " +
        "FROM pg_class c, " +
         "pg_attribute a, " +
         "pg_type t " +
         "WHERE c.relname = '" + table + "' " +
         "AND a.attnum > 0 " +
         "AND a.attrelid = c.oid " +
         "AND a.atttypid = t.oid " +
       "ORDER BY a.attnum " +
      ") as tabledefinition " +
      "group by relname";
    this.execute(database, query,
      results => {
        onSuccess(results[0].rows[0][0]);
      },
      err => {
       // TODO: error handling
      }
    );
  }

  getUpdateStatement(database, table, onSuccess) {
    var query = "SELECT " +
      "'UPDATE ' || relname || E'\n\t' || 'SET ' || array_to_string(array_agg(column_name), E'=?, ') || E'\n' || 'WHERE <condition>;' " +
      "FROM " +
      "( " +
        "SELECT " +
          "c.relname, a.attname AS column_name " +
        "FROM pg_class c, " +
         "pg_attribute a, " +
         "pg_type t " +
         "WHERE c.relname = '" + table + "' " +
         "AND a.attnum > 0 " +
         "AND a.attrelid = c.oid " +
         "AND a.atttypid = t.oid " +
       "ORDER BY a.attnum " +
      ") as tabledefinition " +
      "group by relname";
    this.execute(database, query,
      results => {
        onSuccess(results[0].rows[0][0]);
      },
      err => {
       // TODO: error handling
      }
    );
  }
}
