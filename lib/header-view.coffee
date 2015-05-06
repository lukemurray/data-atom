{View} = require 'atom-space-pen-views'

# The header view for the results view, allowing you to add/change connections or change the DB
module.exports =
class DataAtomView extends View
  @content: ->
    @div class: 'panel-heading padded heading header-view results-header', =>
      @span 'Data Results on', class: 'heading-title', outlet: 'title'
      @span class: '', =>
        @select outlet: 'connectionList', class: '', change: 'onConnectionSelected', =>
          @option 'Select connection...', value: '0', disabled: true
        @select outlet: 'databaseList', class: '', change: 'onDatabaseSelected'
        @button 'New Connection...', class: 'btn btn-default', click: 'onNewConnection', outlet: 'connectionBtn'
        @button 'Disconnect', class: 'btn btn-default', click: 'onDisconnect', outlet: 'disconnectBtn'
      @span
        class: 'heading-close icon-remove-close pull-right'
        outlet: 'closeButton'
        click: 'close'

  close: ->
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:toggle-results-view');

  initialize: ->
    @connectionList.disable()
    @disconnectBtn.disable()

  onDatabaseSelected: (e) ->

  onConnectionSelected: (e) ->
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:connection-changed')

  addConnection: (connectionName) ->
    @connectionList.append('<option value="' + connectionName + '">' + connectionName + '</option>')
    @connectionList.children("option[value='" + connectionName + "']").prop('selected', true)
    @connectionList.enable()
    @disconnectBtn.enable()

  addDbNames: (names) ->
    for name in names
      @databaseList.append('<option value="' + name + '">' + name + '</option>')
    @databaseList.enable()

  setConnection: (connectionName) ->
    @connectionList.children("option[value='" + connectionName + "']").prop('selected', true)

  getSelectedConnection: ->
    @connectionList.children(":selected").attr('value')

  onNewConnection: ->
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:new-connection')

  onDisconnect: ->
    # remove the connection from our list
    #@connectionList.children("option[value='" + connectionName + "']").prop('selected', true)
    @connectionList.children(":selected").remove()
    unless @connectionList.children().length > 1
      @disconnectBtn.disable()
      @connectionList.disable()
    @connectionList.children("option[value='0']").prop('selected', true)
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:disconnect')
