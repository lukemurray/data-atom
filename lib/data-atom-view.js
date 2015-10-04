"use babel";

var DataResultView = require('./data-result-view');
var HeaderView = require('./header-view');

var {TextEditor, Emitter} = require('atom');

module.exports =
class DataAtomView {
  constructor() {
    this.emitter = new Emitter();
    this.createView();
    this.queryInput.style.display = 'none';
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
    // this.element.classList.add('native-key-bindings');

    this.resizeHandle = document.createElement('div');
    this.resizeHandle.classList.add('resize-handle');
    this.element.appendChild(this.resizeHandle);

    var header = document.createElement('header');
    header.classList.add('header');
    header.classList.add('results-header');
    this.element.appendChild(header);

    this.headerView = new HeaderView(this.useEditorQuery);
    header.appendChild(this.headerView.getElement());

    this.queryInput = document.createElement('div');
    header.appendChild(this.queryInput);

    var title = document.createElement('span');
    title.classList.add('heading-title');
    title.innerText = 'Query:';
    this.queryInput.appendChild(title);

    this.queryEditor = document.createElement('atom-text-editor');
    this.queryEditor.classList.add('query-input');
    this.queryEditor.style.height = '40px';
    this.queryEditor.style.maxHeight = '40px';
    // this.queryEditor.getModel().setGrammar('sql');
    this.queryInput.appendChild(this.queryEditor);

    title = document.createElement('span');
    title.classList.add('heading-title');
    title.innerText = 'Results:';
    header.appendChild(title);

    this.resultsView = new DataResultView();
    header.appendChild(this.resultsView[0]);
  }

  useEditorAsQuerySource(useEditor) {
    this.useEditorQuery = useEditor;
    this.headerView.toggleQuerySource(useEditor);
    if (useEditor) {
      this.queryInput.style.display = 'none';
    }
    else {
      this.queryInput.style.display = 'block';
    }
  }

  focusQueryInput() {
    this.queryEditor.focus();
  }

  getQuery() {
    var editor = atom.workspace.getActiveTextEditor();
    return this.useEditorQuery ? (editor.getSelectedText() ? editor.getSelectedText() : editor.getText()) : this.queryEditor.getModel().getText();
  }

  // Tear down any state and detach
  destroy() {
    this.detach();
  }

  show() {
    if (!this.isShowing)
      this.toggleView();
    this.headerHeight = this.headerView.height() + 5;
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
      if (this.resultsView)
        this.resultsView.updateHeight(this.getHeight() - this.headerView.height());
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
    var height = document.body.offsetHeight - e.pageY - this.headerHeight;
    this.element.style.height = height + 'px';
    if (this.resultsView) {
      this.resultsView.updateHeight(this.getHeight() - this.headerView.height());
    }
    this.emitter.emit('data-atom-results-size-changed');
  }

  clear() {
    // clear results view and show things are happening
    this.resultsView.clear();
  }

  setState(connection, dbNames, selectedDb, height, useEditorAsQuery) {
    this.headerView.setConnection(connection);
    this.headerView.addDbNames(dbNames);
    this.headerView.setSelectedDbName(selectedDb);
    this.getHeight(height);
    if (this.resultsView)
      this.resultsView.updateHeight(this.getHeight() - this.headerView.height());
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

  getHeight() {
    return this.element.offsetHeight;
  }

  onConnectionChanged(onConnectionChangedFunc) {
    return this.headerView.onConnectionChanged(onConnectionChangedFunc);
  }

  onSizeChanged(onSizeChangedFunc) {
    return this.emitter.on('data-atom-results-size-changed', onSizeChangedFunc);
  }
}
