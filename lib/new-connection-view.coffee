URL = require 'url'

{$, View, EditorView, SelectListView} = require 'atom'

_ = require 'underscore.string'

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
                  @subview 'url', new EditorView(mini:true, placeholderText: 'postgresql://user:pass@server:5432/db-name')
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
                  @subview 'dbPort', new EditorView(mini:true, placeholderText: '5432')
            @div class: 'form-group', =>
               @label 'Login', class: 'col-md-2 control-label'
               @div class: 'col-md-5', =>
                  @subview 'dbUser', new EditorView(mini:true, placeholderText: 'username')
               @div class: 'col-md-5', =>
                  @subview 'dbPassword', new EditorView(mini:true, placeholderText: 'password')
            @div class: 'form-group', =>
               @label 'Database', class: 'col-md-2 control-label'
               @div class: 'col-md-10', =>
                  @subview 'dbName', new EditorView(mini:true, placeholderText: 'database-name')
            @div class: 'pull-right', =>
               @button 'Connect', class: 'btn btn-default', click: 'connect'
               @button 'Close', class: 'btn btn-default btn-padding-left', click: 'close'

   initialize: (onDone) ->
      @onDone = onDone
      #@databaseType.setItems(['postgresql', 'sqlserver', 'mongodb'])
      @dbUser.getEditor().on 'contents-modified', => @buildUrl()
      @dbPassword.getEditor().on 'contents-modified', => @buildUrl()
      @dbServer.getEditor().on 'contents-modified', => @buildUrl()
      @dbPort.getEditor().on 'contents-modified', => @buildUrl()
      @dbName.getEditor().on 'contents-modified', => @buildUrl()

      @url.getEditor().on 'contents-modified', => @seperateUrl()

   show: ->
      atom.workspaceView.appendToTop(this)
      @url.focus()

   close: ->
      @detach() unless !@hasParent()

   seperateUrl: ->
      return if !@url.isFocused
      urlObj = URL.parse(@url.getText())#, true)
      if urlObj
         @urlQueryStr = urlObj.query
         @dbServer.setText(urlObj.hostname) unless !urlObj.hostname
         @dbPort.setText(urlObj.port) unless !urlObj.port
         @dbName.setText(_.ltrim(urlObj.pathname, '/'))
         if urlObj.auth
            auth = urlObj.auth.split(':')
            if auth
               @dbUser.setText(auth[0])
               @dbPassword.setText(auth[1]) unless auth.length == 1

   buildUrl: ->
      return if @url.isFocused
      # just use postgres for now
      urlStr = 'postgresql://'

      userPass = @dbUser.getText() + ':' + @dbPassword.getText()
      if (userPass != ':')
         urlStr += userPass + '@'

      urlStr += @dbServer.getText()
      if @dbPort.getText() != ''
         urlStr += ':' + @dbPort.getText()
      urlStr += '/' + @dbName.getText()
      urlStr += '?' + @urlQueryStr if @urlQueryStr

      @url.setText(urlStr)

   connect: ->
      @onDone(@url.getText()) unless !@onDone
      @close()
