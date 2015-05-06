{$, View} = require 'atom-space-pen-views'

DataResultView = require './data-result-view'
HeaderView = require './header-view'

module.exports =
class DataAtomView extends View
   @content: ->
      @div class: 'data-atom-panel tool-panel panel panel-bottom padding native-key-bindings', =>
        @div class: 'resize-handle'
        @subview 'headerView', new HeaderView()

   initialize: (serializeState) ->
      @isShowing = false
      @on 'mousedown', '.resize-handle', (e) => @resizeStarted(e)

   setResultView: (resultView) ->
      @resultView.detach() if @resultView
      @resultView = resultView
      @append(@resultView)

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
        atom.workspace.addBottomPanel(item: this)
        @resultView.updateHeight(@height() - @headerView.height() - 20) if @resultView
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
      @resultView.updateHeight(@height() - @headerView.height() - 20) if @resultView
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:result-view-height-changed')

   clear: ->
      #clear results view and show things are happening
      @resultView.clear()

   setMessage: (message) ->
      @resultView.setMessage(message)

   setResults: (results) ->
      @resultView.setResults(results)
