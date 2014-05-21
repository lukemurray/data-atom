URL = require 'url'

PostgresManager = require './postgres-manager'
SqlServerManager = require './sqlserver-manager'

class DbFactory

   getSupportedDatabases: ->
      [
         {name: 'PostgreSQL', prefix: 'postgresql', port: 5432},
         {name: 'MS SQL Server', prefix: 'sqlserver', port: 1433}
      ]

   createDataManagerForUrl: (url) ->
      switch URL.parse(url).protocol.replace(':', '')
         when 'postgresql' then new PostgresManager(url)
         when 'sqlserver' then new SqlServerManager(url)
         else throw Error('Unsupported database: ' + URL.parse(url).protocol)

factory = new DbFactory()

module.exports = factory
