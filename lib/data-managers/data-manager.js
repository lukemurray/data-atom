"use babel";

import URL from 'url';
import _s from 'underscore.string';
import Utils from '../utils.js';

/**
 * Base DataManager. Manages the communication to a database server
 */
export default class DataManager {
  constructor(dbConfig) {
    this.dbConfig = dbConfig;
    this.defaultDatabase = this.dbConfig.dbName;
  }

  destroy() {}

  getConnectionName() {
    return this.dbConfig.getConnectionName();
  }

  //---- Implement these methods to provide support for your favorite DB system
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
