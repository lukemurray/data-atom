"use babel";

var {$} = require('atom-space-pen-views');
var {Emitter} = require('atom');

// The header view for the results view, allowing you to add/change connections or change the DB
module.exports =
class DataAtomView {
  constructor(useEditorQuery) {
    this.emitter = new Emitter();
    this.createView();
    this.connectionList.setAttribute('disabled', true);
    this.databaseList.setAttribute('disabled', true);
    this.disconnectBtn.setAttribute('disabled', true);
    this.useEditorAsQuery = useEditorQuery;
  }

  getElement() {
    return this.element;
  }

  height() {
    return this.element.offsetHeight;
  }

  createView() {
    this.element = document.createElement('header');
    this.element.classList.add('header');
    this.element.classList.add('toolbar');

    this.executeBtn = document.createElement('button');
    this.executeBtn.className = 'btn btn-default btn-query-execute';
    this.executeBtn.innerText = 'Execute';
    this.executeBtn.setAttribute('title', 'Execute');
    this.executeBtn.setAttribute('disabled', true);
    this.executeBtn.addEventListener('click', () => { this.executeQuery(); });
    this.element.appendChild(this.executeBtn);

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.className = 'btn btn-default btn-query-cancel';
    this.cancelBtn.setAttribute('title', 'Cancel execution');
    this.cancelBtn.setAttribute('disabled', true);
    this.cancelBtn.addEventListener('click', () => { this.cancelQuery(); });
    this.element.appendChild(this.cancelBtn);

    this.queryToggle = document.createElement('button');
    this.queryToggle.className = 'btn btn-default btn-query-toggle ';
    if (this.useEditorAsQuery)
      this.queryToggle.className += 'btn-query-toggle-up';
    else
      this.queryToggle.className += 'btn-query-toggle-down';
    this.queryToggle.setAttribute('title', 'Toggle between executing content from the active editor or the query panel below');
    this.queryToggle.addEventListener('click', () => { this.onQueryToggle(); });
    this.element.appendChild(this.queryToggle);

    var ele = document.createElement('span');
    ele.className = 'heading-connection-title';
    ele.innerText = 'Connection:';
    this.element.appendChild(ele);

    this.connectionBtn = document.createElement('button');
    this.connectionBtn.className = 'btn btn-default btn-connect';
    this.connectionBtn.setAttribute('title', 'New connection...');
    this.connectionBtn.addEventListener('click', () => { this.onNewConnection(); });
    this.element.appendChild(this.connectionBtn);

    this.disconnectBtn = document.createElement('button');
    this.disconnectBtn.className = 'btn btn-default btn-disconnect';
    this.disconnectBtn.setAttribute('title', 'Disconnect selected connection');
    this.disconnectBtn.addEventListener('click', () => { this.disconnect(); });
    this.element.appendChild(this.disconnectBtn);

    this.connectionList = document.createElement('select');
    this.connectionList.addEventListener('change', () => { this.onConnectionSelected(); });
    this.element.appendChild(this.connectionList);

    ele = document.createElement('option');
    ele.innerText = 'Select connection...';
    ele.setAttribute('value', '0');
    ele.setAttribute('disabled', true);
    this.connectionList.appendChild(ele);

    ele = document.createElement('span');
    ele.className = 'db-label';
    ele.innerText = 'Database:';
    this.element.appendChild(ele);

    this.databaseList = document.createElement('select');
    this.databaseList.className = 'db-select';
    this.databaseList.addEventListener('change', () => { this.onDatabaseSelected(); });
    this.element.appendChild(this.databaseList);

    this.selectDbEle = document.createElement('option');
    this.selectDbEle.innerText = 'Select database...';
    this.selectDbEle.setAttribute('value', 'data-atom:select-db');
    this.selectDbEle.setAttribute('disabled', true);
    this.databaseList.appendChild(this.selectDbEle);

    var ele = document.createElement('span');
    ele.className = 'heading-close icon-remove-close pull-right';
    ele.addEventListener('click', () => { this.close(); });
    this.element.appendChild(ele);
  }

  close() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:toggle-results-view');
  }

  onDatabaseSelected(e) {
    this.emitter.emit('data-atom-database-changed');
    this.executeBtn.removeAttribute('disabled');
  }

  onConnectionSelected(e) {
    this.emitter.emit('data-atom-connection-changed');
    this.disconnectBtn.removeAttribute('disabled');
  }

  addConnection(connectionName) {
    $(this.connectionList).append('<option value="' + connectionName + '">' + connectionName + '</option>');
    $(this.connectionList).children("option[value='" + connectionName + "']").prop('selected', true);
    this.connectionList.removeAttribute('disabled');
    this.disconnectBtn.removeAttribute('disabled');
  }

  addDbNames(names) {
    this.clearDatabaseSelection();

    for (var j = 0; j < names.length; j++) {
      var name = names[j];
      $(this.databaseList).append('<option value="' + name + '">' + name + '</option>');
    }

    if (names.length > 1) {
      this.databaseList.removeAttribute('disabled');
    }
    else {
      this.databaseList.setAttribute('disabled', true);
      this.executeBtn.setAttribute('disabled', true);
    }
  }

  setSelectedDbName(name) {
    if (name == null)
      name = 'data-atom:select-db';
    $(this.databaseList).children("option[value='" + name + "']").prop('selected', true);
  }

  clearDatabaseSelection() {
    $(this.databaseList).empty();
    this.databaseList.appendChild(this.selectDbEle);
  }

  setConnection(connectionName) {
    $(this.connectionList).children("option[value='" + connectionName + "']").prop('selected', true)
    if (connectionName == '0')
      this.databaseList.setAttribute('disabled', true);
      this.executeBtn.setAttribute('disabled', true);
      this.setSelectedDbName(connectionName);
  }

  getSelectedConnection() {
    return $(this.connectionList).children(":selected").attr('value');
  }

  getSelectedDatabase() {
    return $(this.databaseList).children(':selected').attr('value');
  }

  onNewConnection() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:new-connection');
  }

  disconnect() {
    // remove the connection from our list
    var connectionList  = $(this.connectionList);
    if (connectionList.children().length > 1)
      connectionList.children(":selected").remove();

    connectionList.children("option[value='0']").prop('selected', true);
    // disable them as we select the "select conneciton" option
    this.disconnectBtn.setAttribute('disabled', true);
    this.executeBtn.setAttribute('disabled', true);
    this.emitter.emit('data-atom-disconnect');
    this.emitter.emit('data-atom-connection-changed');
  }

  onDisconnect(onFunc) {
    return this.emitter.on('data-atom-disconnect', onFunc);
  }

  cancelQuery() {
    this.emitter.emit('data-atom-query-cancel');
  }

  executeQuery() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:execute');
  }

  onQueryToggle() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'data-atom:toggle-query-source');
  }

  toggleQuerySource(useEditorAsQuery) {
    if (useEditorAsQuery) {
      this.queryToggle.classList.remove('btn-query-toggle-down');
      this.queryToggle.classList.add('btn-query-toggle-up');
    }
    else {
      this.queryToggle.classList.remove('btn-query-toggle-up');
      this.queryToggle.classList.add('btn-query-toggle-down');
    }
    this.useEditorAsQuery = useEditorAsQuery;
  }

  onConnectionChanged(onConnectionChangedFunc) {
    return this.emitter.on('data-atom-connection-changed', onConnectionChangedFunc);
  }

  onDatabaseChanged(onDatabaseChangedFunc) {
    return this.emitter.on('data-atom-database-changed', onDatabaseChangedFunc);
  }

  onQueryCancel(onQueryCancelFunc) {
    return this.emitter.on('data-atom-query-cancel', onQueryCancelFunc);
  }

  // Let us know that execution has begun. Chance for us to disbale any cnotrols etc.
  executionBegin() {
    this.executeBtn.setAttribute('disabled', true);
    this.queryToggle.setAttribute('disabled', true);
    this.connectionBtn.setAttribute('disabled', true);
    this.disconnectBtn.setAttribute('disabled', true);
    this.connectionList.setAttribute('disabled', true);
    this.databaseList.setAttribute('disabled', true);
    this.cancelBtn.removeAttribute('disabled');
  }
  // Let us know that execution has ended. Chance to re-enable controls etc.
  executionEnd() {
    this.executeBtn.removeAttribute('disabled');
    this.queryToggle.removeAttribute('disabled');
    this.connectionBtn.removeAttribute('disabled');
    this.disconnectBtn.removeAttribute('disabled');
    this.connectionList.removeAttribute('disabled');
    this.databaseList.removeAttribute('disabled');
    this.cancelBtn.setAttribute('disabled', true);
  }
}
