URL = require 'url'

sql = require 'mssql'
_s = require 'underscore.string'

DataManager = require './data-manager'

module.exports =
class SqlServerManager extends DataManager
   constructor: (url) ->
      super(url)
      urlObj = URL.parse(url)

      @config = {
         user: urlObj.auth.split(':')[0],
         password: urlObj.auth.split(':')[1],
         server: urlObj.hostname, # You can use 'localhost\\instance' to connect to named instance
         database: _s.ltrim(urlObj.pathname, '/')
      }
      if urlObj.port
         @config.port = urlObj.port

   execute: (query, onSuccess, onError) =>
      connection = new sql.Connection @config, (err) =>
         if err
            console.error(err)
            onError err
            return

         # Query

         request = connection.request()
         request.query query, (err, recordset) =>
            if err
               console.error(err)
               onError err
               return

            console.log(recordset)
            onSuccess(recordset)
            #onSuccess { command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows }
