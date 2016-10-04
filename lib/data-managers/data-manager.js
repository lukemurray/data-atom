"use babel";

import URL from 'url';
import _s from 'underscore.string';

/**
 * Base DataManager. Manges the communication to a database server
 */
export default class DataManager {
  constructor(url) {
    var urlObj = URL.parse(url);
    this.defaultDatabase = _s.ltrim(urlObj.pathname, '/');
    this.config = {
      protocol: urlObj.protocol,
      user: urlObj.auth ? urlObj.auth.split(':')[0] : '',
      password: urlObj.auth ? urlObj.auth.split(':')[1] : '',
      server: urlObj.hostname // You can use 'localhost\\instance' to connect to named instance
    };

    if (urlObj.port) {
      this.config.port = urlObj.port;
    }
  }

  getUrl() {
    return this.getUrlWithDb(this.defaultDatabase);
  }

  getUrlWithDb(dbName) {
    return this.getUrlNoDb() + '/' + dbName;
  }

  getUrlNoDb() {
    return this.config.protocol + '//' + this.config.user + ':' + this.config.password + '@' + this.config.server + (this.config.port ? ':' + this.config.port : '');
  }

  destroy() {}

  getConnectionName() {
    return this.config.user + '@' + this.config.server;
  }

  //---- Implement these methods to provide support for you favorite DB system
  /**
   * Execute a query against the database
   * @returns a Promise. Resolving the results of the query
   */
  execute(database, query, onQueryToken) {}
  /**
   * Cancels the given query linked by the queryToken (returned by the onQueryToken CB in execute)
   */
  cancelExecution(queryToken) {}
  /**
   * Get the names of DBs available. To show in the DB selection drop down in results panel
   * @returns a Promise. Resolving an array of DB names
   */
  getDatabaseNames() {}
  /**
   * Get available tables to query. Used for autocomplete
   * @returns a Promise. Resolving an array of table details
   */
  getTables(database) {}
  /**
   * Get details of table(s), fields, etc. Use in autocomplete
   * @returns a Promise. resolving an array of details
   */
  getTableDetails(database, tables) {}
  /**
   * Generate a SQL query to select first 100 rows
   * @returns a string
   */
  getTableQuery(table) {}
}
