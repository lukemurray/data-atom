"use babel";

import DataManager from './data-manager';

export default class MetabaseManager extends DataManager {
  constructor(dbConfig) {
    super(dbConfig);
    this.sessionId = null;         // Promise holding session_id
    this.databaseInfo = null;      // Promise holding info on databases
    this.currentDatabase = null;   // currently selected database
    this.currentTables = null;     // Promise holding info on tables of current database
    // Metabase to SQL mappings - https://github.com/metabase/metabase/blob/59557ddd08c043900f76d4fa057945b59aa11748/src/metabase/driver.clj#L296
    this.types = {
      'type/Boolean':    'boolean',
      'type/Float':      'real',
      'type/Integer':    'integer',
      'type/Decimal':    'numeric',
      'type/BigInteger': 'bigint',
      'type/Number':     'numeric',
      'type/Text':       'text',
      'type/Date':       'date',
      'type/DateTime':   'time'
      // 'type/Dictionary': '',
      // 'type/Array':      '',
    };
  }

  destroy() {
    this.logout();
  }

  execute(database, query, onQueryToken) {
    return this.getDatabaseInfo(database)
      .then(db => ({
        database: db.id,
        type: 'native',
        native: {query}
      }))
      .then(params => {
        // cancelling isn't yet possible with fetch - https://github.com/whatwg/fetch/issues/447
        return this.req('post', 'dataset', params);
      })
      .then(response => response.json())
      .then(json => new Promise((resolve, reject) => {
        if (json.error) {
          reject(json.error);
        } else {
          resolve([{
            command: 'SELECT', // @todo check other commands
            fields: json.data.cols.map(col => ({name: col.name})),
            rowCount: json.data.rows.length,
            rows: json.data.rows
          }]);
        }
      }));
  }

  getDatabaseNames() {
    return this.getDatabaseInfo()
      .then(dbs => dbs.map(db => db.name));
  }

  getTables(database) {
    return this.getTableInfo(database);
  }

  getTableDetails(database, tables) {
    return Promise.resolve(
      tables.reduce((r, table) => r.concat(table.fields), [])
    );
  }

  getTableQuery(table) {
    return 'SELECT * FROM ' + table + ' LIMIT 100';
  }

  req(method, endpoint, params) {
    return this.login()
      .then(sessionId => this._req(method, endpoint, params, sessionId));
  }

  _req(method, endpoint, params, sessionId) {
    const url = 'https://' + this.dbConfig.server + '/api/' + endpoint;
    let fetchParams = {
      method: method,
      headers: {'Accept': 'application/json'}
    };
    if (sessionId) {
      fetchParams.headers['x-metabase-session'] = sessionId;
    }
    if (params) {
      fetchParams.body = JSON.stringify(params);
      fetchParams.headers['Content-Type'] = 'application/json';
    }
    return fetch(url, fetchParams);
  }

  getDatabaseInfo(database = null) {
    if (!this.databaseInfo) {
      const manager = this;
      this.databaseInfo = this.req('get', 'database/')
        .then(response => response.json())
        .then(json => {
          // store database info needed later
          return json.map(db => ({
            id: db.id,
            name: db.name
          }));
        })
        .catch(err => {
          manager.databaseInfo = null;
        });
    }

    if (database) {
      return this.databaseInfo
        .then(dbs => dbs.find(db => db.name === database));
    } else {
      return this.databaseInfo;
    }
  }

  getTableInfo(database) {
    if (!this.currentTables || this.currentDatabase !== database) {
      // not loaded or loaded for other database: load it
      const manager = this;
      const types = this.types;
      this.currentDatabase = database;
      this.currentTables = this.getDatabaseInfo(database)
        .then(db => this.req('get', `database/${encodeURIComponent(db.id)}/metadata`))
        .then(response => response.json())
        .then(json => {
          return json.tables
            .filter(table => !table.visibility_type)
            .map(table => {
              return {
                id: table.id,
                name: table.name,
                schemaName: table.schema || 'public', // GA has no schema
                type: 'Table', // @todo distinguish views
                fields: table.fields.map(field => ({
                  name: field.name,
                  type: types[field.base_type],
                  udt: types[field.base_type],
                  tableName: table.name
                }))
              };
            });
        })
        .catch(err => {
          manager.currentTables = null;
        });
    }

    return this.currentTables;
  }

  login() {
    if (!this.sessionId) {
      params = {
        email: this.dbConfig.user,
        password: this.dbConfig.password
      };
      const manager = this;
      this.sessionId = this._req('post', 'session/', params)
        .then(response => {
          if (response.status === 404) {
            return Promise.reject('endpoint missing (check your Metabase URL)')
          } else if (!response.ok) {
            return Promise.reject(`login failed (${response.statusText})`);
          }
          return response.json();
        })
        .then(json => {
          if (json.errors) {
            return Promise.reject(Object.keys(json.errors).map(s => (
              [s, json.errors[s]].join(' ')
            )).join('\n'));
          } else if (!json.id) {
            return Promise.reject('login failed (unknown reason)');
          }
          return json.id;
        })
        .catch(err => {
          manager.sessionId = null;
        });
    }

    return this.sessionId;
  }

  logout() {
    if (!this.sessionId) return Promise.resolve();

    const manager = this;
    return this.sessionId
      .then(sessionId => this.req('delete', 'session/?session_id=' + encodeURIComponent(sessionId)))
      .then(response => { manager.sessionId = null; });
    }
}
