{$, View} = require 'atom'

DataResultView = require './data-result-view'
HeaderView = require './header-view'

module.exports =
class DataAtomView extends View
   @content: ->
      @div class: 'data-atom tool-panel panel panel-bottom padding native-key-bindings', =>
         @div class: 'resize-handle'
         @subview 'headerView', new HeaderView()
         @subview 'resultView', new DataResultView()

   initialize: (serializeState) ->
      @isShowing = false
      @on 'mousedown', '.resize-handle', (e) => @resizeStarted(e)

   # Returns an object that can be retrieved when package is activated
   serialize: ->

   # Tear down any state and detach
   destroy: ->
      @detach()

   show: ->
      @toggleView() if !@hasParent()

   hide: ->
      @toggleView() if @hasParent()

   toggleView: ->
      if @hasParent()
         #stop()
         @detach()
         @isShowing = false
      else
         atom.workspaceView.prependToBottom(this)
         @resultView.updateHeight(@height() - @headerView.height() - 20)
         @isShowing = true

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

   clear: ->
      #clear results view and show things are happening
      @resultView.clear()

   setMessage: (message) ->
      @resultView.setMessage(message)

   setResults: (result) ->
      @resultView.setResults(result)

   updateHeader: (connectionName) ->
      @headerView.update(connectionName)
