{View} = require 'atom'

module.exports =
class DataAtomView extends View
   @content: ->
      @div class: 'panel-heading padded heading header-view', =>
         @span 'Data Results', class: 'heading-title', outlet: 'title'
         @span
            class: 'heading-close icon-remove-close pull-right'
            outlet: 'closeButton'
            click: 'close'

   close: ->
      atom.workspaceView.trigger 'data-atom:toggle-results-view'

   initialize:  ->

   update: (connectionName) ->
      @title.text('Results - Connection: ' + connectionName)
