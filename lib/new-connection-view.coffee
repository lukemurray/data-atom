URL = require 'url'

{$, View, EditorView} = require 'atom'

_ = require 'underscore'
_s = require 'underscore.string'

DbFactory = require './data-managers/db-factory'

module.exports =
class NewConnectionView extends View
   @content: ->
      @div class: 'connection-dialog overlay from-top padded', =>
         @div class: 'inset-panel', =>
            @div class: 'panel-heading heading header-view', =>
               @span 'New connection...', class: 'heading-title', outlet: 'title'

         @div class: 'panel-body padded form-horizontal', =>
            @div class: 'form-group', =>
               @label 'URL', class: 'col-md-2 control-label'
               @div class: 'col-md-10', =>
                  @subview 'url', new EditorView(mini:true)
            @div class: 'form-group', =>
               @label 'DB Type', class: 'col-md-2 control-label'
               @div class: 'col-md-4', =>
                  @select outlet: 'dbType', class: 'form-control'
            @div class: 'form-group', =>
               @label 'Server', class: 'col-md-2 control-label'
               @div class: 'col-md-5', =>
                  @subview 'dbServer', new EditorView(mini:true, placeholderText: 'localhost', change: 'buildUrl')
               @label 'Port', class: 'col-md-2 control-label'
               @div class: 'col-md-3', =>
                  @subview 'dbPort', new EditorView(mini:true)
            @div class: 'form-group', =>
               @label 'Auth', class: 'col-md-2 control-label'
               @div class: 'col-md-5', =>
                  @subview 'dbUser', new EditorView(mini:true, placeholderText: 'username')
               @div class: 'col-md-5', =>
                  @subview 'dbPassword', new EditorView(mini:true, placeholderText: 'password')
            @div class: 'form-group', =>
               @label 'Database', class: 'col-md-2 control-label'
               @div class: 'col-md-10', =>
                  @subview 'dbName', new EditorView(mini:true, placeholderText: 'database-name')
            @div class: 'form-group', =>
               @label 'Options', class: 'col-md-2 control-label'
               @div class: 'col-md-10', =>
                  @subview 'dbOptions', new EditorView(mini:true, placeholderText: 'option=value,ssl=true')
            @div class: 'pull-right', =>
               @button 'Connect', class: 'btn btn-default', click: 'connect'
               @button 'Close', class: 'btn btn-default btn-padding-left', click: 'close'

   initialize: (onConnectClicked) ->
      @onConnectClicked = onConnectClicked
      @placeholderUrlPart = '://user:pass@server/db-name'

      @dbUser.getEditor().on 'contents-modified', => @buildUrl()
      @dbPassword.getEditor().on 'contents-modified', => @buildUrl()
      @dbServer.getEditor().on 'contents-modified', => @buildUrl()
      @dbPort.getEditor().on 'contents-modified', => @buildUrl()
      @dbName.getEditor().on 'contents-modified', => @buildUrl()
      @dbOptions.getEditor().on 'contents-modified', => @buildUrl()

      @url.getEditor().on 'contents-modified', => @seperateUrl()

      supportedDbs = DbFactory.getSupportedDatabases()
      for type in supportedDbs
         @dbType.append('<option value="' + type.prefix + '" data-port="' + type.port + '">' + type.name + '</option>')

      #set placeholder text to the first one
      @urlPrefix = supportedDbs[0].prefix
      @url.setPlaceholderText(@urlPrefix + @placeholderUrlPart)
      @dbPort.setPlaceholderText(supportedDbs[0].port)

      @dbType.on 'change', (e) => @updateDbType(e)

   show: ->
      atom.workspaceView.appendToTop(this)
      @url.focus()

   close: ->
      @detach() unless !@hasParent()

   seperateUrl: ->
      return if !@url.isFocused
      urlObj = URL.parse(@url.getText())#, true)
      if urlObj
         if urlObj.query
            @dbOptions.setText(urlObj.query.replace('&', ', '))
         @dbServer.setText(urlObj.hostname) unless !urlObj.hostname
         @dbPort.setText(urlObj.port) unless !urlObj.port
         @dbName.setText(_s.ltrim(urlObj.pathname, '/'))
         if urlObj.auth
            auth = urlObj.auth.split(':')
            if auth
               @dbUser.setText(auth[0])
               @dbPassword.setText(auth[1]) unless auth.length == 1

   buildUrl: ->
      return if @url.isFocused
      # just use postgres for now
      urlStr = @urlPrefix + '://'

      userPass = @dbUser.getText() + ':' + @dbPassword.getText()
      if (userPass != ':')
         urlStr += userPass + '@'

      urlStr += @dbServer.getText()
      if @dbPort.getText() != ''
         urlStr += ':' + @dbPort.getText()
      urlStr += '/' + @dbName.getText()
      if @dbOptions.getText()
         urlStr += '?'
         _.each(@dbOptions.getText().split(','), (s) => urlStr += _s.trim(s) + '&')
         urlStr = _s.rtrim(urlStr, '&')

      @url.setText(urlStr)

   updateDbType: (e) ->
      for n in @dbType.children()
         if n.selected
            @urlPrefix = $(n).attr('value')
            @dbPort.setPlaceholderText($(n).attr('data-port'))
            @url.setPlaceholderText(@urlPrefix + @placeholderUrlPart)
            return

   connect: ->
      @onConnectClicked(@url.getText()) unless !@onConnectClicked
      @close()
