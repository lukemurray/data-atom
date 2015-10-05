"use babel";

var DataResultView = require('./data-result-view');
var HeaderView = require('./header-view');

var {TextEditor, Emitter} = require('atom');

module.exports =
class DataAtomView {
  constructor() {
    this.emitter = new Emitter();
    this.createView();
    this.querySection.style.display = 'none';
    this.useEditorQuery = true;
    this.isShowing = false;
    this.resizeHandle.addEventListener('mousedown', e => this.resizeStarted(e));
  }

  createView() {
    this.element = document.createElement('section');
    this.element.classList.add('data-atom-panel');
    this.element.classList.add('tool-panel');
    this.element.classList.add('panel');
    this.element.classList.add('panel-bottom');
    this.element.classList.add('padding');

    this.resizeHandle = document.createElement('div');
    this.resizeHandle.classList.add('resize-handle');
    this.element.appendChild(this.resizeHandle);

    this.headerView = new HeaderView(this.useEditorQuery);
    this.element.appendChild(this.headerView.getElement());

    this.querySection = document.createElement('section');
    this.querySection.classList.add('query-section');
    this.element.appendChild(this.querySection);

    var title = document.createElement('span');
    title.classList.add('heading-title');
    title.innerText = 'Query:';
    this.querySection.appendChild(title);

    this.queryEditor = document.createElement('atom-text-editor');
    this.queryEditor.classList.add('query-input');
    this.queryEditor.style.height = '40px';
    this.queryEditor.style.maxHeight = '40px';
    // this.queryEditor.getModel().setGrammar('sql');
    this.querySection.appendChild(this.queryEditor);

    var resultSection = document.createElement('section');
    resultSection.classList.add('results-section');
    this.element.appendChild(resultSection);

    title = document.createElement('span');
    title.classList.add('heading-title');
    title.innerText = 'Results:';
    resultSection.appendChild(title);

    this.resultsView = new DataResultView();
    resultSection.appendChild(this.resultsView[0]);
  }

  useEditorAsQuerySource(useEditor) {
    this.useEditorQuery = useEditor;
    this.headerView.toggleQuerySource(useEditor);
    if (useEditor) {
      this.querySection.style.display = 'none';
    }
    else {
      this.querySection.style.display = 'block';
    }
  }

  focusQueryInput() {
    this.queryEditor.focus();
  }

  getQuery() {
    var editor = atom.workspace.getActiveTextEditor();
    return this.useEditorQuery ? (editor.getSelectedText() ? editor.getSelectedText() : editor.getText()) : this.queryEditor.getModel().getText();
  }

  getSelectedDatabase() {
    return this.headerView.getSelectedDatabase();
  }

  getSelectedConnection() {
    return this.headerView.getSelectedConnection();
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  show() {
    if (!this.isShowing)
      this.toggleView();
  }

  hide() {
    if (this.isShowing)
      this.toggleView();
  }

  toggleView() {
    if (this.isShowing) {
      this.element.parentNode.removeChild(this.element);
      this.isShowing = false;
    }
    else {
      atom.workspace.addBottomPanel({item:this.element});
      this.isShowing = true;
    }
  }

  resizeStarted() {
    var self = this;
    this.moveHandler = function(e) { self.resizeResultsView(e); };
    document.body.addEventListener('mousemove', this.moveHandler);
    this.stopHandler = function() { self.resizeStopped(); };
    document.body.addEventListener('mouseup', this.stopHandler);
  }

  resizeStopped() {
    document.body.removeEventListener('mousemove', this.moveHandler);
    document.body.removeEventListener('mouseup', this.stopHandler);
  }

  resizeResultsView(e) {
    var height = document.body.offsetHeight - e.pageY - (this.headerView.height() -10);
    this.element.style.height = height + 'px';
  }

  clear() {
    // clear results view and show things are happening
    this.resultsView.clear();
  }

  setState(connection, dbNames, selectedDb, useEditorAsQuery) {
    this.headerView.setConnection(connection);
    this.headerView.addDbNames(dbNames);
    this.headerView.setSelectedDbName(selectedDb);
    this.useEditorAsQuerySource(useEditorAsQuery);
  }

  setMessage(message) {
    this.resultsView.setMessage(message);
  }

  setResults(results) {
    this.resultsView.setResults(results);
  }

  addConnection(connectionName) {
    this.headerView.addConnection(connectionName);
  }

  clearDatabaseSelection() {
    this.headerView.clearDatabaseSelection();
  }

  setDatabaseSelection(dbNames, selectedName) {
    this.headerView.addDbNames(dbNames);
    this.headerView.setSelectedDbName(selectedName);
  }

  // register for selected connection change events
  onConnectionChanged(onConnectionChangedFunc) {
    return this.headerView.onConnectionChanged(onConnectionChangedFunc);
  }

  // Register for selected database change events
  onDatabaseChanged(onDatabaseChangedFunc) {
    return this.headerView.onDatabaseChanged(onDatabaseChangedFunc);
  }

  // Let us know that execution has begun. Chance for us to disbale any cnotrols etc.
  executionBegin() {
    this.headerView.executionBegin();
  }
  // Let us know that execution has ended. Chance to re-enable controls etc.
  executionEnd() {
    this.headerView.executionEnd();
  }
}
