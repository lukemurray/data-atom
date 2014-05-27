{$} = require 'atom'

DataAtomView = require './data-atom-view'
DataResultView = require './data-result-view'
NewConnectionView = require './new-connection-view'
DbFactory = require './data-managers/db-factory'

###
The main entry and controller for Data Atom.
- A single DataAtomView is used, shown or hidden based on the state of a editor
- A DataResultView is kept for each editor and swapped in/out of the DataAtomView as required
- This gives the feeling that each editor has their own results but we only have 1 single toolbar for connections etc.
###
module.exports =
class DataAtomController
   constructor: (serializeState) ->
      @viewToEditor = {}

      @mainView = new DataAtomView()
      @mainView.on('data-atom:new-connection', => @createNewConnection())
      @mainView.on('data-atom:disconnect', => @onDisconnect())
      @mainView.on('data-atom:connection-changed', => @onConnectionChanged())
      @mainView.on('data-atom:result-view-height-changed', (e) =>
         @currentViewState.height = $(e.target).height())

      atom.workspaceView.command "data-atom:execute", => @execute()
      atom.workspaceView.command 'data-atom:toggle-results-view', => @toggleView()

      atom.workspaceView.on 'pane-container:active-pane-item-changed', => @updateResultsView()

   # show the results view for the selected editor
   updateResultsView: ->
      @mainView.hide()
      @currentViewState = null;
      if atom.workspace.getActiveEditor() && atom.workspace.getActiveEditor().getPath()
         @currentViewState = @viewToEditor[atom.workspace.getActiveEditor().getPath()]
         if @currentViewState && @currentViewState.isShowing
            @show()

   destroy: ->
      @mainView.off('data-atom:new-connection')
      @currentViewState = null

   serialize: ->

   # Gets or creates the ResultView state for the current editor
   getOrCreateCurrentResultView: ->
      if !@currentViewState && !@viewToEditor[atom.workspace.getActiveEditor().getPath()]
         @viewToEditor[atom.workspace.getActiveEditor().getPath()] = {view: new DataResultView(), isShowing: false, dataManager: null}

      @currentViewState = @viewToEditor[atom.workspace.getActiveEditor().getPath()]

   show: ->
      @mainView.setResultView(@getOrCreateCurrentResultView().view)
      # set the selected connection too
      @mainView.headerView.setConnection(@currentViewState.dataManager?.getConnectionName() ? '0')
      @mainView.show()
      @mainView.height(@currentViewState.height)
      @currentViewState.isShowing = true

   toggleView: ->
      if @mainView.isShowing
         @mainView.hide()
      else
         @show()
      @getOrCreateCurrentResultView().isShowing = @mainView.isShowing

   onConnectionChanged: ->
      selectedName = @mainView.headerView.getSelectedConnection()
      for key, value of @viewToEditor
         if value.dataManager?.getConnectionName() == selectedName
            @currentViewState.dataManager = value.dataManager
            break;

   onDisconnect: ->
      # currentViewState Will have the dataManager
      @currentViewState.dataManager.destroy()
      # see if other views have it as an active connection
      for key, value of @viewToEditor
         value.dataManager = null if value.dataManager?.getConnectionName() == @currentViewState.dataManager.getConnectionName()
      @currentViewState.dataManager = null

   createNewConnection: (thenDo) ->
      # prompt for a connection
      ncv = new NewConnectionView (url) =>
         dbmanager = DbFactory.createDataManagerForUrl(url)
         @getOrCreateCurrentResultView().dataManager = dbmanager
         # tell the view so it can list them in the drop down
         @mainView.headerView.addConnection(dbmanager.getConnectionName())
         thenDo() if thenDo
      ncv.show()

   execute: ->
      if !@currentViewState || !@currentViewState.dataManager
         @createNewConnection(=> @actuallyExecute(@currentViewState))
      else
         @actuallyExecute(@currentViewState)

   actuallyExecute: (executingViewState) ->
      # make sure it's showing
      @show()
      executingViewState.view.clear()

      editor = atom.workspace.getActiveEditor()
      query = if editor.getSelectedText() then editor.getSelectedText() else editor.getText()

      executingViewState.dataManager.execute query
      , (result) =>
         if result.message
            executingViewState.view.setMessage(result.message)
         else
            executingViewState.view.setResults(result)
      , (err) =>
         executingViewState.view.setMessage(err)
