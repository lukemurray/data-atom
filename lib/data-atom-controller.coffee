DataAtomView = require './data-atom-view'
NewConnectionView = require './new-connection-view'
DbFactory = require './data-managers/db-factory'

module.exports =
class DataAtomController
   constructor: (serializeState) ->
      @viewToEditor = {}

      atom.workspaceView.command "data-atom:execute", => @execute()
      atom.workspaceView.command 'data-atom:toggle-results-view', => @toggleView()

      atom.workspaceView.on 'pane-container:active-pane-item-changed', => @updateResultsView()

   updateResultsView: ->
      @currentViewState?.view?.hide()
      @currentViewState = null;
      if atom.workspace.getActiveEditor() && atom.workspace.getActiveEditor().getPath()
         @currentViewState = @viewToEditor[atom.workspace.getActiveEditor().getPath()]
         @currentViewState.view.show() if @currentViewState && @currentViewState.isShowing

   destroy: ->
      @currentViewState = null

   serialize: ->

   setOrCreateCurrentView: ->
      if !@currentViewState && !@viewToEditor[atom.workspace.getActiveEditor().getPath()]
         @viewToEditor[atom.workspace.getActiveEditor().getPath()] = {view: new DataAtomView(), isShowing: false}

      @currentViewState = @viewToEditor[atom.workspace.getActiveEditor().getPath()]

   toggleView: ->
      @setOrCreateCurrentView().view.toggleView()
      @currentViewState.isShowing = @currentViewState.view.isShowing

   execute: ->
      if !@dataManager
         # prompt for a connection
         ncv = new NewConnectionView((url) =>
            @dataManager = DbFactory.createDataManagerForUrl(url)
            @actuallyExecute())
         ncv.show()
      else
         @actuallyExecute()

   actuallyExecute: ->
      # make sure it's showing
      @setOrCreateCurrentView()
      @currentViewState.view.show()
      @currentViewState.isShowing = true
      @currentViewState.view.clear()

      editor = atom.workspace.getActiveEditor()
      query = if editor.getSelectedText() then editor.getSelectedText() else editor.getText()

      @currentViewState.view.updateHeader(@dataManager.getConnectionName())
      @dataManager.execute query
      , (result) =>
         if result.message
            @currentViewState.view.setMessage(result.message)
         else
            @currentViewState.view.setResults(result)
      , (err) =>
         @resultView.setMessage(err)
         @dataManager = null
