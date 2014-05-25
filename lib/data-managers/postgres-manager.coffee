pg = require 'pg'

DataManager = require './data-manager'

module.exports =
class PostgresManager extends DataManager
   constructor: (url) ->
      super(url)

   execute: (query, onSuccess, onError) ->
      pg.connect @url, (err, client, done) =>
         if err
            console.error 'Error fetching client from pool', err
            onError err

         client.query {text: query, rowMode: 'array'}, (err, result) =>
            # call `done()` to release the client back to the pool
            done();

            if err
               console.error 'Query error - ' + err
               onError err unless !onError
            else if onSuccess
               @callOnSuccess result, onSuccess

   # conver the results into what we expect so the UI doens't have to handle all different result types
   callOnSuccess: (result, onSuccess) ->
      #console.log result
      if result.command != 'SELECT'
         onSuccess { message: @buildMessage(result), command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows }
      else
         onSuccess { command: result.command, fields: result.fields, rowCount: result.rowCount, rows: result.rows }

   buildMessage: (results) ->
      switch results.command
         when 'UPDATE' then results.rowCount + ' rows updated.'
         when 'DELETE' then results.rowCount + ' rows deleted.'
         else JSON.stringify(results)
