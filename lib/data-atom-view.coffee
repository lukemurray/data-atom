{$, View} = require 'atom-space-pen-views'

DataResultView = require './data-result-view'
HeaderView = require './header-view'

module.exports =
class DataAtomView extends View
  @content: ->
    @div class: 'data-atom-panel tool-panel panel panel-bottom padding native-key-bindings', =>
      @div class: 'resize-handle'
      @subview 'headerView', new HeaderView()
      @subview 'resultView', new DataResultView()

  initialize: (serializeState) ->
    @isShowing = false
    @on 'mousedown', '.resize-handle', (e) => @resizeStarted(e)

  setResults: (results) ->
    @resultView.setResults(results);

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()

  show: ->
    @toggleView() if !@hasParent()
    @headerHeight = @headerView.height() + 5

  hide: ->
    @toggleView() if @hasParent()

  toggleView: ->
    if @hasParent()
      #stop()
      @detach()
      @isShowing = false
    else
      atom.workspace.addBottomPanel(item: this)
      @resultView.updateHeight(@height() - @headerView.height()) if @resultView
      @isShowing = true

  resizeStarted: =>
    $(document.body).on('mousemove', @resizeResultsView)
    $(document.body).on('mouseup', @resizeStopped)

  resizeStopped: =>
    $(document.body).off('mousemove', @resizeResultsView)
    $(document.body).off('mouseup', @resizeStopped)

  resizeResultsView: ({pageY}) =>
    height = $(document.body).height() - pageY - @headerHeight
    @height(height)
    @resultView.updateHeight(@height() - @headerView.height()) if @resultView
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:result-view-height-changed')

  clear: ->
    #clear results view and show things are happening
    @resultView.clear()

  setState: (connection, dbNames, selectedDb, height) ->
    @headerView.setConnection(connection);
    @headerView.addDbNames(dbNames);
    @headerView.setSelectedDbName(selectedDb);
    @height(height);
    @resultView.updateHeight(@height() - @headerView.height()) if @resultView

  setMessage: (message) ->
    @resultView.setMessage(message)

  setResults: (results) ->
    @resultView.setResults(results)

  addConnection: (connectionName) ->
    @headerView.addConnection(connectionName)

  getHeight: () ->
    @height()
