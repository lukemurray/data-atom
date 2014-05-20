{$, View} = require 'atom'

DataResultView = require './data-result-view'
HeaderView = require './header-view'
NewConnectionView = require './new-connection-view'

module.exports =
class DataAtomView extends View
   @content: ->
      @div class: 'data-atom tool-panel panel panel-bottom padding native-key-bindings', =>
         @div class: 'resize-handle'
         @subview 'headerView', new HeaderView()
         @subview 'resultView', new DataResultView()

   initialize: (serializeState, dataManager) ->
      @dataManager = dataManager
      atom.workspaceView.command "data-atom:execute", => @execute()
      atom.workspaceView.command 'data-atom:toggle-view', => @toggleView()

      @on 'mousedown', '.resize-handle', (e) => @resizeStarted(e)

   # Returns an object that can be retrieved when package is activated
   serialize: ->

   # Tear down any state and detach
   destroy: ->
      @detach()

   toggleView: ->
      if @hasParent()
         #stop()
         @detach()
      else
         atom.workspaceView.prependToBottom(this)
         @resultView.updateHeight(@height() - @headerView.height() - 20)

   resizeStarted: =>
      $(document.body).on('mousemove', @resizeTreeView)
      $(document.body).on('mouseup', @resizeStopped)

   resizeStopped: =>
      $(document.body).off('mousemove', @resizeTreeView)
      $(document.body).off('mouseup', @resizeStopped)

   resizeTreeView: ({pageY}) =>
      height = $(document.body).height() - pageY
      @height(height)
      @resultView.updateHeight(@height() - @headerView.height() - 20)

   execute: ->
      if !@dataManager.hasConnection()
         # prompt for a connection
         ncv = new NewConnectionView((url) =>
            @dataManager.setConnection(url)
            @actuallyExecute())
         ncv.show()
      else
         @actuallyExecute()

   actuallyExecute: ->
      @toggleView() if !@hasParent()
      editor = atom.workspace.getActiveEditor()
      query = if editor.getSelectedText() then editor.getSelectedText() else editor.getText()

      @dataManager.execute query
      , (result) =>
         console.log result
         @resultView.setResults(result)
      , (err) =>
         @resultView.setMessage(err)
