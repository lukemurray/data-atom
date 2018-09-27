"use babel";

import DataResultView from './data-result-view';
import HeaderView from './header-view';
import utils from '../utils';

import {TextEditor, Emitter} from 'atom';

export default class DataAtomView {
  constructor() {
    this.emitter = new Emitter();
    this.createView();
    this.workspaceItem = {
        element: this.element,
        getTitle: () => 'Data Atom',
        getIconName: () => 'database',
        getURI: () => "atom://data-atom/main-view",
        getDefaultLocation: () => 'bottom',
    };
    this.querySection.style.display = 'none';
  }

  createView() {
    this.element = document.createElement('section');
    this.element.className = 'data-atom data-atom-panel tool-panel panel panel-bottom padding';

    this.headerView = new HeaderView(true);
    this.element.appendChild(this.headerView.element);

    this.querySection = document.createElement('section');
    this.querySection.classList.add('query-section');
    this.element.appendChild(this.querySection);

    var title = document.createElement('span');
    title.classList.add('heading-title');
    title.innerText = 'Query:';
    this.querySection.appendChild(title);

    var textEditor = atom.workspace.buildTextEditor();
    textEditor.autoHeight = false;
    this.queryEditor = textEditor.getElement();
    this.queryEditor.classList.add('query-input');
    this.queryEditor.style.height = '40px';
    this.queryEditor.style.maxHeight = '40px';
    this.querySection.appendChild(this.queryEditor);

    let queryEditorModel = this.queryEditor.getModel();
    let sqlGrammar = atom.grammars.grammarForScopeName('source.sql');
    queryEditorModel.setGrammar(sqlGrammar);

    this.resultsView = new DataResultView();
    this.element.appendChild(this.resultsView.getElement());
  }

  useEditorAsQuerySource(useEditor) {
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

  getQuery(useEditorAsQuery, useQueryAtCursor) {
    var editor = atom.workspace.getActiveTextEditor();
    if (useEditorAsQuery) {
      var selectedText = editor.getSelectedText();
      if (useQueryAtCursor && !selectedText) {
        var selectionRange = utils.getRangeForQueryAtCursor(editor);
        editor.setSelectedBufferRange(selectionRange);
        selectedText = editor.getSelectedText();
      }
      return selectedText ? selectedText : editor.getText();
    } else {
      return this.queryEditor.getModel().getText();
    }
  }

  setQuery(query) {
    this.queryEditor.getModel().setText(query);
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

  get isShowing() {
      for (let dock of [atom.workspace.getBottomDock(), atom.workspace.getLeftDock(), atom.workspace.getRightDock()]) {
          if (dock.paneContainer.activePane.activeItem == this.workspaceItem) {
              return true;
          }
      }
      return false;
  }

  async show() {
    if (!this.isShowing)
      return await this.toggleView();
  }

  async hide() {
    if (this.isShowing)
      return await this.toggleView();
  }

  async toggleView() {
    return await atom.workspace.toggle(this.workspaceItem);
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

  onQueryCancel(onQueryCancelFunc) {
    return this.headerView.onQueryCancel(onQueryCancelFunc);
  }

  // Let us know that execution has begun. Chance for us to disbale any cnotrols etc.
  executionBegin() {
    this.headerView.executionBegin();
  }
  // Let us know that execution has ended. Chance to re-enable controls etc.
  executionEnd() {
    this.headerView.executionEnd();
  }

  onDisconnect(onFunc) {
    return this.headerView.onDisconnect(onFunc);
  }
}
