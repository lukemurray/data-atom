{$, View, EditorView, SelectListView} = require 'atom'

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
                  #@input outlet: 'url', class: 'form-control', placeholder: 'postgresql://user:pass@server:5432/db-name'
                  @subview 'url', new EditorView(mini:true, placeholderText: 'postgresql://user:pass@server:5432/db-name')
            @div class: 'form-group', =>
               @label 'DB Type', class: 'col-md-2 control-label'
               @div class: 'col-md-4', =>
                  @select outlet: 'databaseType', class: 'form-control'
            @div class: 'form-group', =>
               @label 'Server', class: 'col-md-2 control-label'
               @div class: 'col-md-5', =>
                  #@input outlet: 'databaseServer', class: 'form-control', placeholder: 'localhost'
                  @subview 'databaseServer', new EditorView(mini:true, placeholderText: 'localhost')
               @label 'Port', class: 'col-md-2 control-label'
               @div class: 'col-md-3', =>
                  #@input outlet: 'databasePort', class: 'form-control', placeholder: '5432'
                  @subview 'databasePort', new EditorView(mini:true, placeholderText: '5432')
            @div class: 'form-group', =>
               @label 'Login', class: 'col-md-2 control-label'
               @div class: 'col-md-5', =>
                  #@input outlet: 'databaseUser', class: 'form-control', placeholder: 'username'
                  @subview 'databaseUser', new EditorView(mini:true, placeholderText: 'username')
               @div class: 'col-md-5', =>
                  #@input outlet: 'databasePassword', class: 'form-control', placeholder: 'password'
                  @subview 'databasePassword', new EditorView(mini:true, placeholderText: 'password')
            @div class: 'form-group', =>
               @label 'Database', class: 'col-md-2 control-label'
               @div class: 'col-md-10', =>
                  #@input outlet: 'databaseName', class: 'form-control', placeholder: 'database-name'
                  @subview 'databaseName', new EditorView(mini:true, placeholderText: 'database-name')
            @div class: 'pull-right', =>
               @button 'Connect', class: 'btn btn-default', click: 'connect'
               @button 'Close', class: 'btn btn-default btn-padding-left', click: 'close'

   initialize: (onDone) ->
      @onDone = onDone
      #@databaseType.setItems(['postgresql', 'sqlserver', 'mongodb'])
      @url.focus()

   close: ->
      @detach() unless !@hasParent()

   connect: ->
      @onDone(@url.getText()) unless !@onDone
      @close()
