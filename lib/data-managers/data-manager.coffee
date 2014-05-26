URL = require 'url'

_s = require 'underscore.string'

module.exports =
class DataManager
   constructor: (url) ->
      @url = url
      urlObj = URL.parse(url)
      @config = {
         user: urlObj.auth.split(':')[0],
         password: urlObj.auth.split(':')[1],
         server: urlObj.hostname, # You can use 'localhost\\instance' to connect to named instance
         database: _s.ltrim(urlObj.pathname, '/')
      }
      if urlObj.port
         @config.port = urlObj.port

   execute: (query, onSuccess, onError) ->

   getConnectionName: ->
      @config.server + '/' + @config.database
