pg = require 'pg'

module.exports =
class DataManager
   constructor: (url) ->
      @url = url

   execute: (query, onSuccess, onError) ->
