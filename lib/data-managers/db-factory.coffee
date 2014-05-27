URL = require 'url'

class DbFactory

   getSupportedDatabases: ->
      [
         {name: 'PostgreSQL', prefix: 'postgresql', port: 5432},
         {name: 'MS SQL Server', prefix: 'sqlserver', port: 1433}
      ]

   createDataManagerForUrl: (url) ->
      switch URL.parse(url).protocol.replace(':', '')
         when 'postgresql'
            PostgresManager = require './postgres-manager'
            new PostgresManager(url)
         when 'sqlserver'
            SqlServerManager = require './sqlserver-manager'
            new SqlServerManager(url)
         else
            throw Error('Unsupported database: ' + URL.parse(url).protocol)

factory = new DbFactory()

module.exports = factory
