#{allowUnsafeEval, allowUnsafeNewFunction} = require 'loophole'
pg = require 'pg'

@url = undefined

module.exports =
class DataManager
   hasConnection: =>
      @url != undefined

   execute: (query, onSuccess, onError) =>
      pg.connect @url, (err, client, done) =>
         if err
            console.error 'Error fetching client from pool', err
            onError err

         client.query query, (err, result) =>
            # call `done()` to release the client back to the pool
            done();

            if err
               console.log 'Query error - ' + err
               onError err unless !onError
            else if onSuccess
               onSuccess result

   setConnection: (url) =>
      @url = url
